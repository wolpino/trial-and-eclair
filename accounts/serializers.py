from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User, UserRole


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "subscription_status",
            "trial_ends_at",
            "measurement_preference",
            "show_forks",
            "is_guest",
            "date_joined",
        )
        read_only_fields = fields


class MeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("show_forks",)


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True, default="")
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value: str) -> str:
        taken = User.objects.filter(username__iexact=value)
        guest = self.context.get("guest")
        if guest is not None:
            taken = taken.exclude(pk=guest.pk)
        if taken.exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate(self, attrs: dict) -> dict:
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data: dict) -> User:
        guest = self.context.get("guest")
        if guest is not None:
            guest.username = validated_data["username"]
            guest.email = validated_data.get("email", "")
            guest.set_password(validated_data["password"])
            guest.is_guest = False
            guest.save(update_fields=["username", "email", "password", "is_guest"])
            return guest
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            role=UserRole.HOME_COOK,
        )


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs: dict) -> dict:
        user = authenticate(
            username=attrs["username"],
            password=attrs["password"],
        )
        if user is None:
            raise serializers.ValidationError("Invalid username or password.")
        attrs["user"] = user
        return attrs
