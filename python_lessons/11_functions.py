# ============================================================
# LESSON 11: Functions
# ============================================================
# A function is a reusable block of code.
# Define once, call many times.

# ---- DEFINING A FUNCTION ----
def greet():
    print("Hello, World!")

greet()   # call the function
greet()   # call it again

# ---- PARAMETERS & ARGUMENTS ----
def greet_person(name):
    print(f"Hello, {name}!")

greet_person("Abdurr")
greet_person("Alice")

# ---- MULTIPLE PARAMETERS ----
def add(a, b):
    return a + b       # return sends a value back to the caller

result = add(3, 5)
print(result)          # 8
print(add(10, 20))     # 30

# ---- DEFAULT PARAMETER VALUES ----
def power(base, exponent=2):   # exponent defaults to 2
    return base ** exponent

print(power(3))       # 9  (3^2)
print(power(3, 3))    # 27 (3^3)
print(power(2, 10))   # 1024

# ---- KEYWORD ARGUMENTS ----
def describe_pet(name, animal="dog"):
    print(f"{name} is a {animal}")

describe_pet("Rex")                      # Rex is a dog
describe_pet("Whiskers", "cat")          # positional
describe_pet(animal="parrot", name="Polly")  # keyword order doesn't matter

# ---- RETURNING MULTIPLE VALUES ----
def min_max_avg(numbers):
    return min(numbers), max(numbers), sum(numbers) / len(numbers)

low, high, avg = min_max_avg([4, 7, 2, 9, 1])
print(f"Min={low}, Max={high}, Avg={avg:.1f}")

# ---- *args — variable number of positional arguments ----
def total(*numbers):
    return sum(numbers)

print(total(1, 2, 3))          # 6
print(total(10, 20, 30, 40))   # 100

# ---- **kwargs — variable number of keyword arguments ----
def print_info(**details):
    for key, value in details.items():
        print(f"  {key}: {value}")

print_info(name="Abdurr", age=20, city="Lagos")

# ---- DOCSTRINGS (documenting functions) ----
def celsius_to_fahrenheit(c):
    """Convert Celsius temperature to Fahrenheit."""
    return (c * 9 / 5) + 32

print(celsius_to_fahrenheit(100))   # 212.0
help(celsius_to_fahrenheit)         # shows the docstring

# ---- LAMBDA (anonymous one-line function) ----
square = lambda x: x ** 2
print(square(5))     # 25

add = lambda a, b: a + b
print(add(3, 7))     # 10

# Lambdas shine with sorted() / map() / filter()
names = ["Charlie", "Alice", "Bob"]
names.sort(key=lambda n: len(n))   # sort by name length
print(names)   # ['Bob', 'Alice', 'Charlie']

numbers = [1, 2, 3, 4, 5, 6]
evens   = list(filter(lambda x: x % 2 == 0, numbers))
doubled = list(map(lambda x: x * 2, numbers))
print(evens)    # [2, 4, 6]
print(doubled)  # [2, 4, 6, 8, 10, 12]

# ============================================================
# MINI PROJECT: Temperature Converter
# ============================================================
def convert_temp(value, unit):
    """Convert temperature between C and F."""
    if unit.upper() == "C":
        return (value * 9 / 5) + 32, "F"
    elif unit.upper() == "F":
        return (value - 32) * 5 / 9, "C"
    else:
        return None, "Unknown unit"

val = float(input("\nEnter temperature: "))
unit = input("Unit (C or F): ")
converted, new_unit = convert_temp(val, unit)
if converted is not None:
    print(f"{val}°{unit.upper()} = {converted:.2f}°{new_unit}")

# ============================================================
# EXERCISES
# ============================================================
# 1. Write a function is_even(n) that returns True if n is even.
# 2. Write a function factorial(n) using a loop.
# 3. Write a function that takes a list and returns a new list
#    with duplicates removed, preserving order.
