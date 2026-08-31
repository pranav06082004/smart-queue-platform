import pandas as pd
import numpy as np

np.random.seed(42)

SERVICE_TYPES = ["general", "specialist", "quick"]
N = 5000

rows = []
for _ in range(N):
    service_type = np.random.choice(SERVICE_TYPES)
    time_of_day = np.random.randint(0, 24)
    day_of_week = np.random.randint(0, 7)
    active_counters = np.random.randint(1, 5)
    people_ahead = np.random.randint(0, 30)

    base_service_minutes = {"general": 8, "specialist": 15, "quick": 3}[service_type]

    # Busier during 10-13 and 16-18, slightly slower on Mondays (day 0)
    peak_multiplier = 1.3 if time_of_day in [10, 11, 12, 13, 16, 17, 18] else 1.0
    monday_multiplier = 1.15 if day_of_week == 0 else 1.0

    effective_service_time = base_service_minutes * peak_multiplier * monday_multiplier
    noise = np.random.normal(0, 2)

    actual_wait = max(0, (people_ahead * effective_service_time / active_counters) + noise)

    rows.append({
        "peopleAhead": people_ahead,
        "activeCounters": active_counters,
        "serviceType": service_type,
        "timeOfDay": time_of_day,
        "dayOfWeek": day_of_week,
        "actualWaitMinutes": round(actual_wait, 1),
    })

df = pd.DataFrame(rows)
df.to_csv("data/queue_history.csv", index=False)
print(f"Generated {len(df)} synthetic rows to data/queue_history.csv")