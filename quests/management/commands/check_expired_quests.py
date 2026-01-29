from typing import Any
from django.core.management.base import BaseCommand
from django.utils import timezone
from quests.models import Quest


class Command(BaseCommand):
    help = "Finds active quests that have passed their end_time and marks them as failed."

    def handle(self, *args: Any, **options: Any) -> None:
        now = timezone.now()

        # Bulk update: extremely efficient for large datasets
        updated_count = Quest.objects.filter(status="active", end_time__lt=now).update(status="failed", updated_at=now)

        if updated_count > 0:
            self.stdout.write(self.style.SUCCESS(f"Successfully marked {updated_count} quest(s) as failed."))
        else:
            self.stdout.write(self.style.NOTICE("No expired active quests found."))
