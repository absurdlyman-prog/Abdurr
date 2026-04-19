# ============================================================
# LESSON 02: Variables & Data Types
# ============================================================
# A VARIABLE is a named container that stores a value.
# You create one with:  variable_name = value

name = "Abdurr"
age = 20
height = 5.9
is_student = True

print(name)
print(age)
print(height)
print(is_student)

# --- The 4 Core Data Types ---
# str   → text,  written in quotes        e.g. "hello"
# int   → whole numbers                   e.g. 42
# float → decimal numbers                 e.g. 3.14
# bool  → True or False only

# --- type() tells you what type a value is ---
print(type(name))        # <class 'str'>
print(type(age))         # <class 'int'>
print(type(height))      # <class 'float'>
print(type(is_student))  # <class 'bool'>

# --- Variable Naming Rules ---
# ✓ Use letters, numbers, underscores
# ✓ Must START with a letter or underscore (not a number)
# ✓ Case-sensitive: 'age' and 'Age' are different variables
# ✗ No spaces or special characters

first_name = "Ada"
last_name  = "Lovelace"

# --- Changing a variable's value ---
score = 10
print(score)   # 10
score = 99
print(score)   # 99

# --- Multiple assignment in one line ---
x, y, z = 1, 2, 3
print(x, y, z)

# --- Assign same value to many variables ---
a = b = c = 0
print(a, b, c)

# ============================================================
# EXERCISES
# ============================================================
# 1. Create a variable 'city' with your city name and print it.
# 2. Create 'temperature' = 36.6 and print its type.
# 3. Swap the values of two variables:
#    x = 5
#    y = 10
#    After swapping: x should be 10, y should be 5.
#    Hint: you can swap in one line: x, y = y, x

x = 5
y = 10
x, y = y, x
print("x =", x, "y =", y)   # x = 10 y = 5
