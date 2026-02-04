import logging
import requests
import os
from urllib.parse import quote
from django.core.files.base import ContentFile
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

WIDTH_IMAGE_SIZE = 1024
HEIGHT_IMAGE_SIZE = 1024
MODEL = "nanobanana"


def generate_achievement_image(
    quest_title: str, quest_description: str, achievement_name: str, seed: int = None
) -> ContentFile | None:
    try:
        # Construct prompt for image generation
        prompt = (
            f"Нужно нарисовать ачивку с названием '{achievement_name}'. "
            f"Квест после которого дается ачивка называется: {quest_title}. "
            f"digital art"
        )

        # Truncate description if too long to avoid URL length issues
        if quest_description and len(quest_description) < 100:
            prompt += f". Описание квеста ачивки: {quest_description}"

        # URL encode the prompt
        encoded_prompt = quote(prompt)

        # Pollinations.ai API endpoint
        api_key = os.environ.get("POLLINATIONS_API_KEY", "")
        api_url = f"https://gen.pollinations.ai/image/{encoded_prompt}?model={MODEL}&key={api_key}"

        # Add parameters for better quality
        params = {
            "width": WIDTH_IMAGE_SIZE,
            "height": HEIGHT_IMAGE_SIZE,
            "seed": seed if seed is not None else (hash(achievement_name) % 10000),
            "nologo": "true",
        }

        logger.info(f"Generating image for achievement: {achievement_name}")

        # Make request to Pollinations.ai
        response = requests.get(api_url, params=params, timeout=60)
        response.raise_for_status()

        # Create ContentFile from response
        image_content = ContentFile(response.content)

        logger.info(f"Successfully generated image for: {achievement_name}")
        return image_content

    except requests.RequestException as e:
        logger.error(f"Failed to generate image for {achievement_name}: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error generating image for {achievement_name}: {e}")
        return None
