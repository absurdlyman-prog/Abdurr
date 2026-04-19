# ============================================================
# LESSON 07: Loops (for & while)
# ============================================================

# ---- FOR LOOP ----
# Iterates over a sequence (list, string, range, etc.)

fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# ---- range() ----
# range(stop)           → 0, 1, 2, ..., stop-1
# range(start, stop)    → start, ..., stop-1
# range(start, stop, step)

for i in range(5):
    print(i, end=" ")   # end=" " keeps output on one line
print()                 # newline after

for i in range(1, 6):
    print(i, end=" ")
print()

for i in range(0, 10, 2):    # even numbers
    print(i, end=" ")
print()

for i in range(10, 0, -1):   # countdown
    print(i, end=" ")
print()

# ---- Looping over a string ----
for char in "Python":
    print(char, end="-")
print()

# ---- enumerate() — get index AND value ----
colors = ["red", "green", "blue"]
for index, color in enumerate(colors):
    print(f"{index}: {color}")

# ---- WHILE LOOP ----
# Repeats AS LONG AS a condition is True
count = 1
while count <= 5:
    print(count, end=" ")
    count += 1
print()

# ---- BREAK — exit a loop early ----
for num in range(10):
    if num == 5:
        break
    print(num, end=" ")
print()   # 0 1 2 3 4

# ---- CONTINUE — skip current iteration ----
for num in range(10):
    if num % 2 == 0:
        continue
    print(num, end=" ")   # only odd numbers
print()

# ---- NESTED LOOPS ----
for row in range(1, 4):
    for col in range(1, 4):
        print(f"{row}x{col}={row*col}", end="  ")
    print()

# ---- while with user input (input loop) ----
print("\nType 'quit' to stop.")
while True:
    text = input("Enter something: ")
    if text.lower() == "quit":
        print("Goodbye!")
        break
    print(f"You typed: {text}")

# ---- LOOP PATTERNS ----

# Sum of numbers 1 to 100
total = 0
for i in range(1, 101):
    total += i
print(f"Sum 1-100 = {total}")   # 5050

# Find first even number greater than 7 in a list
numbers = [3, 7, 2, 9, 4, 6]
found = None
for n in numbers:
    if n > 7 and n % 2 == 0:
        found = n
        break
print("Found:", found)   # None (there's no even > 7 here, 9 is odd)

# ============================================================
# EXERCISES
# ============================================================
# 1. Print multiplication table of any number using a for loop.
# 2. Use a while loop to keep asking for a password until correct.
# 3. Print all numbers 1-50 divisible by 3 but NOT by 9.
