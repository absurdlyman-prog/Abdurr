# ============================================================
# LESSON 13: Modules & Packages
# ============================================================
# A module is a .py file containing reusable code.
# Python ships with a huge standard library of modules.

# ---- Importing a module ----
import math

print(math.pi)           # 3.14159...
print(math.e)            # 2.71828...
print(math.sqrt(144))    # 12.0
print(math.floor(3.9))   # 3
print(math.ceil(3.1))    # 4
print(math.log(100, 10)) # 2.0 — log base 10 of 100
print(math.factorial(6)) # 720

# ---- Import specific names ----
from math import sqrt, pi

print(sqrt(25))   # 5.0  — no need for math.sqrt
print(pi)         # 3.14159...

# ---- Import with an alias ----
import math as m
print(m.sin(m.pi / 2))   # 1.0

# ---- random module ----
import random

print(random.random())            # float between 0.0 and 1.0
print(random.randint(1, 10))      # int between 1 and 10 (inclusive)
print(random.choice(["a","b","c"]))  # random item from list

items = [1, 2, 3, 4, 5]
random.shuffle(items)
print(items)                      # shuffled in place

sample = random.sample(range(100), 5)  # 5 unique random numbers
print(sample)

# ---- datetime module ----
from datetime import datetime, date, timedelta

now = datetime.now()
print(now)
print(now.year, now.month, now.day)
print(now.strftime("%d-%m-%Y %H:%M"))  # formatted string

today = date.today()
print(today)

birthday = date(2000, 6, 15)
age_days = (today - birthday).days
print(f"Days since birthday: {age_days}")

tomorrow = today + timedelta(days=1)
print("Tomorrow:", tomorrow)

# ---- os module ----
import os

print(os.getcwd())             # current working directory
print(os.listdir("."))         # files in current directory
# os.mkdir("new_folder")       # create directory
# os.rename("old.txt","new.txt")

# ---- sys module ----
import sys

print(sys.version)             # Python version
print(sys.platform)            # 'linux', 'win32', 'darwin'

# ---- string module ----
import string

print(string.ascii_lowercase)  # abcdefghijklmnopqrstuvwxyz
print(string.digits)           # 0123456789
print(string.punctuation)

# ---- Creating your own module ----
# Create a file called  my_utils.py  with:
#
#   def greet(name):
#       return f"Hello, {name}!"
#
#   PI = 3.14159
#
# Then in another file:
#   import my_utils
#   print(my_utils.greet("Abdurr"))
#   print(my_utils.PI)

# ---- __name__ guard ----
# This block only runs when the file is executed directly,
# not when it's imported as a module.
if __name__ == "__main__":
    print("Running as main script")

# ============================================================
# EXERCISES
# ============================================================
# 1. Use the random module to simulate rolling a 6-sided die 10 times.
#    Count how many times you roll a 6.
# 2. Use datetime to calculate how many days until New Year's Day.
# 3. Use os to list only .py files in the current directory.
#    Hint: [f for f in os.listdir(".") if f.endswith(".py")]
