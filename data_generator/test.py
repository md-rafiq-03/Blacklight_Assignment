import mysql.connector
from faker import Faker
from datetime import datetime
import random


def generate_userid(name):
    # Split the name into first name and last name
    first_name = name.split()[0].lower()  # Consider only the first name and convert to lowercase

    # Generate a random string of 4 digits
    random_digits = ''.join([str(random.randint(0, 9)) for _ in range(6)])

    # Combine the first name and random digits to form the user ID
    user_id = first_name + random_digits
    return user_id


# Connect to MySQL database
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",
    database="Blacklight"
)
cursor = conn.cursor()

# Create Faker instance for generating fake data
fake = Faker()

# Generate and insert 10,000 rows of data

for _ in range(10000):
    name = fake.name()
    # uid = fake.uuid4()
    uid=generate_userid(name)
    # print(uid)
    score = random.randint(0, 1000)
    country = fake.country_code(representation="alpha-2")
    timestamp = fake.date_time_between(start_date="-1y", end_date="now")
    sql = "INSERT INTO leaderboard (UID, Name, Score, Country, TimeStamp) VALUES (%s, %s, %s, %s, %s)"
    val = (uid, name, score, country, timestamp)
    # print(val)
    cursor.execute(sql, val)

# Commit changes and close connection
conn.commit()
conn.close()
