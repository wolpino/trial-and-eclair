"""
Django settings for Trial and Eclair.
"""

import os
import urllib.parse
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"
_DEV_SECRET = "django-insecure-dev-only-change-in-production"


def _csv(name: str, default: str) -> list[str]:
    return [part.strip() for part in os.environ.get(name, default).split(",") if part.strip()]


def _flag(name: str, default: str) -> bool:
    return os.environ.get(name, default).lower() in ("true", "1", "yes")


def _postgres_config(url: str) -> dict:
    parsed = urllib.parse.urlparse(url)
    sslmode = urllib.parse.parse_qs(parsed.query).get("sslmode", [""])[0]
    config: dict = {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": parsed.path.lstrip("/"),
        "USER": parsed.username or "",
        "PASSWORD": urllib.parse.unquote(parsed.password or ""),
        "HOST": parsed.hostname or "",
        "PORT": parsed.port or 5432,
    }
    if sslmode:
        config["OPTIONS"] = {"sslmode": sslmode}
    return config


# Off unless DEBUG=True is set (local dev: .env.example sets it).
DEBUG = _flag("DEBUG", "False")
SECRET_KEY = os.environ.get("SECRET_KEY", _DEV_SECRET)
if not DEBUG and SECRET_KEY == _DEV_SECRET:
    raise ImproperlyConfigured("Set SECRET_KEY when DEBUG is False.")

ALLOWED_HOSTS = _csv("ALLOWED_HOSTS", "localhost,127.0.0.1")
_render_host = os.environ.get("RENDER_EXTERNAL_HOSTNAME", "").strip()
if _render_host and _render_host not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(_render_host)

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "accounts",
    "catalog",
    "development",
    "collection",
    "library",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

def _sqlite_name(url: str) -> str:
    prefix = "sqlite:///"
    if not url.startswith(prefix):
        return str(BASE_DIR / "db.sqlite3")
    path = url[len(prefix) :]
    if path in {"", ":memory:"}:
        return ":memory:" if path == ":memory:" else str(BASE_DIR / "db.sqlite3")
    if path.startswith("/"):
        return path
    return str(BASE_DIR / path)


DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{BASE_DIR / 'db.sqlite3'}")

if DATABASE_URL.startswith("sqlite"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": _sqlite_name(DATABASE_URL),
        }
    }
elif DATABASE_URL.startswith("postgres"):
    DATABASES = {"default": _postgres_config(DATABASE_URL)}
else:
    raise ValueError(f"Unsupported DATABASE_URL: {DATABASE_URL}")

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATIC_ROOT.mkdir(exist_ok=True)
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}
WHITENOISE_ROOT = FRONTEND_DIST

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"
SERVE_MEDIA = _flag("SERVE_MEDIA", "True")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    # One error shape, no exception text in bodies (see README "API errors").
    "EXCEPTION_HANDLER": "config.exceptions.api_exception_handler",
    # Scoped throttles (see README). Counts live in the default cache, so each
    # gunicorn worker keeps its own count until a shared cache is added.
    "DEFAULT_THROTTLE_RATES": {
        "guest_create": "10/hour",
        "register": "10/hour",
        "login": "20/hour",
        "url_import": "30/day",
        "url_import_guest": "10/day",
        "scan_import": "20/day",
        "scan_import_guest": "5/day",
    },
    # Proxies in front of the app; DRF uses it to pick the client IP from
    # X-Forwarded-For. Unset means the whole header is used as the key.
    "NUM_PROXIES": (
        int(os.environ["THROTTLE_NUM_PROXIES"]) if os.environ.get("THROTTLE_NUM_PROXIES") else None
    ),
}

CORS_ALLOWED_ORIGINS = _csv(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = _csv(
    "CSRF_TRUSTED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
if _render_host:
    _render_origin = f"https://{_render_host}"
    if _render_origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(_render_origin)

if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = _flag("SECURE_SSL_REDIRECT", "True")
    SECURE_HSTS_SECONDS = int(os.environ.get("SECURE_HSTS_SECONDS", "31536000"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {"handlers": ["console"], "level": os.environ.get("LOG_LEVEL", "INFO")},
}

IDEA_IMAGE_LIMIT = 1
TEST_SESSION_PHOTO_LIMIT = 5
PUBLISHED_HERO_IMAGE_LIMIT = 1
SCAN_UPLOAD_MAX_BYTES = 10 * 1024 * 1024
