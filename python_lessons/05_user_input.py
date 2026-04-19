# ============================================================
# LESSON 05: User Input & Type Conversion
# ============================================================
# input() pauses the program and waits for the user to type.
# It ALWAYS returns a string.

name = input("What is your name? ")
print(f"Hello, {name}!")

# ---- TYPE CONVERSION ----
# Because input() returns a string, you must convert
# to the right type before doing math.

age_str = input("How old are you? ")
age = int(age_str)            # convert string → int
print(f"In 10 years you will be {age + 10}.")

# Shortcut: wrap input() directly
height = float(input("Your height in cm? "))
print(f"Your height in meters: {height / 100:.2f}")
# :.2f means "show 2 decimal places"

# ---- COMMON CONVERSION FUNCTIONS ----
# int("42")      → 42
# float("3.14")  → 3.14
# str(100)       → "100"
# bool(1)        → True    bool(0) → False

print(int("42"))
print(float("3.14"))
print(str(100))
print(bool(0), bool(1))

# ---- CHECKING BEFORE CONVERTING ----
# .isdigit() returns True if the string has only digits
value = "123"
if value.isdigit():
    print(int(value) * 2)   # 246

# ============================================================
# MINI PROJECT: Simple Calculator
# ============================================================
print("\n--- Simple Calculator ---")
num1 = float(input("Enter first number:  "))
num2 = float(input("Enter second number: "))

print(f"{num1} + {num2} = {num1 + num2}")
print(f"{num1} - {num2} = {num1 - num2}")
print(f"{num1} * {num2} = {num1 * num2}")
if num2 != 0:
    print(f"{num1} / {num2} = {num1 / num2:.4f}")
else:
    print("Cannot divide by zero!")

# ============================================================
# EXERCISES
# ============================================================
# 1. Ask the user for two numbers and print their sum.
# 2. Ask the user for their birth year and calculate their age.
# 3. Ask for a temperature in Celsius and convert to Fahrenheit:
#    F = (C * 9/5) + 32
