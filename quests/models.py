from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Quest(models.Model):
    STATUS_CHOICES = [
        ("created", "Created"),
        ("active", "Active"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="quests")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    planned_achievement_name = models.CharField(max_length=255)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="created")

    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["status", "end_time"]),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.status})"

    @property
    def is_expired(self) -> bool:
        if self.status == "active" and self.end_time and timezone.now() > self.end_time:
            return True
        return False


class Achievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="achievements")
    quest = models.OneToOneField(Quest, on_delete=models.CASCADE, related_name="achievement")
    name = models.CharField(max_length=255)
    icon_key = models.CharField(max_length=50, default="star")
    awarded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Achievement: {self.name} for {self.user.username}"
