from pymongo import MongoClient
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


# Connect to MongoDB database
client = MongoClient('mongodb+srv://mdrafeequg20:S9pXOVwgd7ao74Bk@cluster0.grodjyb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['Blacklight']
leaderboard_collection = db['leaderboard']

# Create Faker instance for generating fake data
fake = Faker()

# Generate and insert 10,000 rows of data
for _ in range(10000):
    name = fake.name()
    uid = generate_userid(name)
    score = random.randint(0, 1000)
    country = fake.country_code(representation="alpha-2")
    timestamp = fake.date_time_between(start_date="-1y", end_date="now")
    
    leaderboard_data = {
        'UID': uid,
        'Name': name,
        'Score': score,
        'Country': country,
        'Timestamp': timestamp
    }
    
    leaderboard_collection.insert_one(leaderboard_data)

print("Data insertion complete.")

client.close()
