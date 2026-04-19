# ============================================================
# LESSON 06: Conditionals (if / elif / else)
# ============================================================
# Conditionals let your program make decisions.
# INDENTATION (4 spaces) defines what's inside each block.

score = 85

if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
elif score >= 70:
    print("Grade: C")
elif score >= 60:
    print("Grade: D")
else:
    print("Grade: F")

# ---- SIMPLE if / else ----
temperature = 30

if temperature > 25:
    print("It's hot outside.")
else:
    print("It's cool outside.")

# ---- NESTED if ----
age = 20
has_ticket = True

if age >= 18:
    if has_ticket:
        print("Welcome to the concert!")
    else:
        print("You need a ticket.")
else:
    print("Sorry, adults only.")

# ---- COMBINING CONDITIONS ----
username = "admin"
password = "1234"

if username == "admin" and password == "1234":
    print("Login successful!")
else:
    print("Wrong credentials.")

# ---- ONE-LINE (TERNARY) if ----
# value_if_true  if  condition  else  value_if_false
x = 10
label = "even" if x % 2 == 0 else "odd"
print(f"{x} is {label}")

# ---- CHECKING MEMBERSHIP ----
fruits = ["apple", "banana", "cherry"]
if "banana" in fruits:
    print("We have bananas!")

# ---- FALSY VALUES ----
# These all evaluate as False in a condition:
# 0, 0.0, "", [], {}, None
name = ""
if name:
    print(f"Hello, {name}")
else:
    print("Name is empty!")

# ============================================================
# MINI PROJECT: Grade Calculator
# ============================================================
print("\n--- Grade Calculator ---")
marks = int(input("Enter your marks (0-100): "))

if marks < 0 or marks > 100:
    print("Invalid marks!")
elif marks >= 90:
    print("Grade A — Excellent!")
elif marks >= 75:
    print("Grade B — Good job!")
elif marks >= 60:
    print("Grade C — Average.")
elif marks >= 40:
    print("Grade D — Needs improvement.")
else:
    print("Grade F — Please try again.")

# ============================================================
# EXERCISES
# ============================================================
# 1. Ask the user to input a number and print "positive",
#    "negative", or "zero".
# 2. Ask for a year and check if it's a leap year.
#    A leap year is divisible by 4 but NOT 100,
#    OR divisible by 400.
# 3. Write a simple login check: username="user", password="pass".
