import pandas as pd
import numpy as np

np.random.seed(7)

SERVICE_TYPES = ["general", "specialist", "quick"]
N = 6000

def demand_level(time_of_day, day_of_week, service_type):
    # Base demand curve: quiet early/late, busy mid-morning and late afternoon
    if time_of_day in [10, 11, 12, 13]:
        base = 3
    elif time_of_day in [16, 17, 18]:
        base = 2
    elif time_of_day in [9, 14, 15]:
        base = 1
    else:
        base = 0

    # Mondays busier, weekends quieter
    if day_of_week == 0:
        base += 1
    if day_of_week in [5, 6]:
        base -= 1

    # Specialist services have naturally lower volume
    if service_type == "specialist":
        base -= 1

    base += np.random.choice([-1, 0, 0, 0, 1])  # noise
    base = max(0, min(3, base))

    return ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"][base]

rows = []
for _ in range(N):
    time_of_day = np.random.randint(0, 24)
    day_of_week = np.random.randint(0, 7)
    service_type = np.random.choice(SERVICE_TYPES)
    level = demand_level(time_of_day, day_of_week, service_type)
    rows.append({
        "timeOfDay": time_of_day,
        "dayOfWeek": day_of_week,
        "serviceType": service_type,
        "demandLevel": level,
    })

df = pd.DataFrame(rows)
df.to_csv("data/demand_history.csv", index=False)
print(f"Generated {len(df)} synthetic demand rows")
print(df["demandLevel"].value_counts())