from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [("admin", "Admin"), ("user", "User")]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")

    def is_admin_user(self):
        return self.role == "admin"


class Course(models.Model):
    LEVEL_CHOICES = [("Beginner", "Beginner"), ("Intermediate", "Intermediate"), ("Advanced", "Advanced")]
    title       = models.CharField(max_length=200)
    description = models.TextField()
    instructor  = models.CharField(max_length=100)
    schedule    = models.CharField(max_length=200)
    duration    = models.CharField(max_length=100)
    level       = models.CharField(max_length=20, choices=LEVEL_CHOICES, default="Beginner")
    category    = models.CharField(max_length=100, blank=True)
    capacity    = models.PositiveIntegerField(default=20)
    start_date  = models.DateField(null=True, blank=True)
    fee         = models.CharField(max_length=50, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    @property
    def enrolled_count(self):
        return self.registrations.filter(status__in=["pending", "accepted"]).count()

    @property
    def is_full(self):
        return self.enrolled_count >= self.capacity

    def __str__(self):
        return self.title


class Registration(models.Model):
    STATUS_CHOICES = [("pending", "Pending"), ("accepted", "Accepted"), ("rejected", "Rejected")]
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name="registrations")
    course     = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="registrations")
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "course")

    def __str__(self):
        return f"{self.user.get_full_name()} → {self.course.title} ({self.status})"
