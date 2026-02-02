import logging
import requests
from urllib.parse import quote
from django.core.files.base import ContentFile


logger = logging.getLogger(__name__)


def generate_achievement_image(
    quest_title: str, quest_description: str, achievement_name: str, rarity: str
) -> ContentFile | None:
    """
    Generate an achievement image using Pollinations.ai API.

    Args:
        quest_title: Title of the quest
        quest_description: Description of the quest
        achievement_name: Name of the achievement
        rarity: Rarity level (bronze, silver, gold, diamond)

    Returns:
        ContentFile with image data or None if generation failed
    """
    try:
        # Map rarity to visual style
        rarity_styles = {
            "bronze": "bronze medal, warm copper tones, beginner achievement",
            "silver": "silver medal, cool metallic tones, intermediate achievement",
            "gold": "golden trophy, radiant gold tones, legendary achievement, glowing aura",
            "diamond": "diamond crystal, brilliant prismatic light, mythic achievement, ethereal glow",
        }

        style = rarity_styles.get(rarity, rarity_styles["silver"])

        # Construct prompt for image generation
        prompt = (
            f"Fantasy RPG achievement badge icon for '{achievement_name}'. "
            f"Quest theme: {quest_title}. "
            f"Style: {style}. "
            f"Centered icon, game UI design, detailed, vibrant colors, "
            f"digital art, professional game asset"
        )

        # Truncate description if too long to avoid URL length issues
        if quest_description and len(quest_description) < 100:
            prompt += f". Context: {quest_description}"

        # URL encode the prompt
        encoded_prompt = quote(prompt)

        # Pollinations.ai API endpoint
        api_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}"

        # Add parameters for better quality
        params = {"width": 512, "height": 512, "seed": hash(achievement_name) % 10000, "nologo": "true"}

        logger.info(f"Generating image for achievement: {achievement_name}")

        # Make request to Pollinations.ai
        response = requests.get(api_url, params=params, timeout=30)
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
