import pytest
from unittest.mock import patch, MagicMock
from django.core.files.base import ContentFile
from quests.image_generator import generate_achievement_image, WIDTH_IMAGE_SIZE, HEIGHT_IMAGE_SIZE


@pytest.mark.django_db
class TestImageGenerator:
    @patch("quests.image_generator.requests.get")
    def test_generate_image_success(self, mock_get):
        # Arrange
        mock_response = MagicMock()
        mock_response.content = b"fake_image_data"
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        # Act
        result = generate_achievement_image(
            quest_title="Test Quest",
            quest_description="Test Description",
            achievement_name="Test Achievement",
        )

        # Assert
        assert isinstance(result, ContentFile)
        assert result.read() == b"fake_image_data"
        mock_get.assert_called_once()

        args, kwargs = mock_get.call_args
        url = args[0]
        assert "gen.pollinations.ai" in url
        assert kwargs["params"]["width"] == WIDTH_IMAGE_SIZE
        assert kwargs["params"]["height"] == HEIGHT_IMAGE_SIZE

    @patch("quests.image_generator.requests.get")
    def test_generate_image_with_custom_seed(self, mock_get):
        # Arrange
        mock_response = MagicMock()
        mock_response.content = b"fake_image_data"
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        # Act
        custom_seed = 1234
        result = generate_achievement_image(
            quest_title="Test Quest",
            quest_description="Test Description",
            achievement_name="Test Achievement",
            seed=custom_seed,
        )

        # Assert
        assert isinstance(result, ContentFile)
        args, kwargs = mock_get.call_args
        assert kwargs["params"]["seed"] == custom_seed

    @patch("quests.image_generator.requests.get")
    def test_generate_image_api_failure(self, mock_get):
        # Arrange
        mock_response = MagicMock()
        mock_response.raise_for_status.side_effect = Exception("API Error")
        mock_get.return_value = mock_response

        # Act
        result = generate_achievement_image(
            quest_title="Test Quest",
            quest_description="Test Description",
            achievement_name="Test Achievement",
        )

        # Assert
        assert result is None

    @patch("quests.image_generator.requests.get")
    def test_generate_image_timeout(self, mock_get):
        # Arrange
        from requests.exceptions import Timeout

        mock_get.side_effect = Timeout("Request timed out")

        # Act
        result = generate_achievement_image(
            quest_title="Test Quest",
            quest_description="Test Description",
            achievement_name="Test Achievement",
        )

        # Assert
        assert result is None
