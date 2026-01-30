import time
import subprocess
import sys


def run_scheduler():
    print("Starting background scheduler...")
    while True:
        try:
            print("Running check_expired_quests...")
            subprocess.run([sys.executable, "manage.py", "check_expired_quests"], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error running command: {e}")
        except Exception as e:
            print(f"Unexpected error: {e}")

        # Wait for 60 seconds
        time.sleep(60)


if __name__ == "__main__":
    run_scheduler()
