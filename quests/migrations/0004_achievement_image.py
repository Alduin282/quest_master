# Generated manually for adding image field to Achievement model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("quests", "0003_achievement_rarity_quest_difficulty"),
    ]

    operations = [
        migrations.AddField(
            model_name="achievement",
            name="image",
            field=models.ImageField(blank=True, null=True, upload_to="achievements/"),
        ),
    ]
