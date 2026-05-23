from rest_framework import serializers
from .models import User, Course, Registration


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role"]


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name", "password", "password2"]

    def validate(self, data):
        if data["password"] != data.pop("password2"):
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class CourseSerializer(serializers.ModelSerializer):
    enrolled_count = serializers.ReadOnlyField()
    is_full        = serializers.ReadOnlyField()

    class Meta:
        model  = Course
        fields = ["id","title","description","instructor","schedule","duration",
                  "level","category","capacity","start_date","fee",
                  "enrolled_count","is_full","created_at","updated_at"]
        read_only_fields = ["id","enrolled_count","is_full","created_at","updated_at"]


class RegistrationSerializer(serializers.ModelSerializer):
    user_name   = serializers.CharField(source="user.get_full_name", read_only=True)
    user_email  = serializers.EmailField(source="user.email", read_only=True)
    course_title= serializers.CharField(source="course.title", read_only=True)
    course_id   = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), source="course")

    class Meta:
        model  = Registration
        fields = ["id","course_id","course_title","user_name","user_email",
                  "status","created_at","updated_at"]
        read_only_fields = ["id","status","created_at","updated_at"]

    def validate(self, data):
        user   = self.context["request"].user
        course = data["course"]
        if Registration.objects.filter(user=user, course=course).exists():
            raise serializers.ValidationError("Already registered for this course.")
        if course.is_full:
            raise serializers.ValidationError("This course is full.")
        return data

    def create(self, validated_data):
        return Registration.objects.create(user=self.context["request"].user, **validated_data)


class RegistrationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Registration
        fields = ["id","status"]
