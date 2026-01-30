# Quest Master 🛡️

Quest Master is a gamified task management application that turns your daily to-dos into an RPG adventure. Complete quests, earn XP, and unlock unique achievements to build your "Hall of Fame".

![Dashboard Screenshot Placeholder](screenshots/dashboard.png)

## 🌟 Features

### Quest Management
- **Create & Track**: Define quests with titles, descriptions, and deadlines.
- **Difficulty Tiers**: Choose between **Easy**, **Medium**, **Hard**, and **Insane** difficulties.
- **Duration Tracking**: Set custom durations (Days/Hours/Minutes) for your quests.
- **Status System**: Quests automatically transition between Created, Active, Completed, or Failed states.

### Achievement System
- **Automatic Rewards**: Successfully completing a quest grants a unique achievement.
- **Rarity System**: Achievement rarity scales with quest difficulty:
  - 🌱 Easy → **Bronze**
  - ⚔️ Medium → **Silver**
  - 🔥 Hard → **Gold**
  - 💎 Insane → **Diamond**
- **Visual Gallery**: A beautiful "Hall of Fame" to showcase your earned trophies with specialized visual effects for high-tier rewards.

![Achievements Screenshot Placeholder](screenshots/achievements.png)

## 🛠️ Tech Stack

- **Backend**: Django, Django REST Framework (DRF)
- **Frontend**: React, Vite, Tailwind CSS
- **Testing**: Vitest, React Testing Library
- **Animations**: Framer Motion

## 🚀 Future Roadmap

We are actively working on expanding the social and interactive aspects of Quest Master:

1.  **Telegram Notifications**: Get real-time alerts about quest deadlines and earned achievements directly in Telegram.
2.  **Friend System**: Add friends and view their "Hall of Fame".
3.  **Social Quests**: Challenge friends to complete specific quests.
4.  **AI-Generated Art**: Use Generative AI to create unique, one-of-a-kind icons and artwork for your achievements based on the quest description.

## 📦 Installation & Setup

### Backend (Django)
```bash
cd quest_service
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.
