# ============================================================
# LESSON 04: Strings
# ============================================================
# A string is a sequence of characters enclosed in quotes.

greeting = "Hello, World!"

# ---- LENGTH ----
print(len(greeting))   # 13 — number of characters

# ---- INDEXING (access one character) ----
# Index starts at 0
print(greeting[0])    # H
print(greeting[7])    # W
print(greeting[-1])   # ! (negative = count from the end)

# ---- SLICING (access a portion) ----
# string[start : end]  — end is NOT included
print(greeting[0:5])   # Hello
print(greeting[7:12])  # World
print(greeting[:5])    # Hello  (start defaults to 0)
print(greeting[7:])    # World! (end defaults to end of string)

# ---- CASE METHODS ----
name = "abdurr"
print(name.upper())        # ABDURR
print(name.capitalize())   # Abdurr
print("PYTHON".lower())    # python

# ---- STRIP (remove whitespace) ----
messy = "   hello   "
print(messy.strip())    # "hello"
print(messy.lstrip())   # "hello   "
print(messy.rstrip())   # "   hello"

# ---- REPLACE ----
sentence = "I love cats"
print(sentence.replace("cats", "dogs"))   # I love dogs

# ---- SPLIT & JOIN ----
csv = "apple,banana,cherry"
fruits = csv.split(",")       # creates a list
print(fruits)                 # ['apple', 'banana', 'cherry']

words = ["Python", "is", "great"]
print(" ".join(words))        # Python is great

# ---- CHECK CONTENTS ----
print("hello".startswith("he"))   # True
print("hello".endswith("lo"))     # True
print("ell" in "hello")           # True  (membership test)

# ---- f-STRINGS (formatted strings) ----
# The cleanest way to embed variables inside strings
name = "Abdurr"
age  = 20
print(f"My name is {name} and I am {age} years old.")
print(f"Next year I will be {age + 1}.")   # math inside {}

# ---- MULTI-LINE STRINGS ----
poem = """Roses are red,
Violets are blue,
Python is awesome,
And so are you!"""
print(poem)

# ---- ESCAPE CHARACTERS ----
print("He said \"Python is great!\"")   # He said "Python is great!"
print("Line 1\nLine 2")                 # \n = new line
print("Tab\there")                      # \t = tab

# ============================================================
# EXERCISES
# ============================================================
# 1. Given s = "Hello, Python!", print only "Python".
# 2. Count the number of letter 'l' in "Hello, World!" using .count()
# 3. Use an f-string: given item = "pizza" and price = 9.99,
#    print: "One pizza costs $9.99"

s = "Hello, Python!"
print(s[7:13])                              # Python
print("Hello, World!".count("l"))           # 3
item, price = "pizza", 9.99
print(f"One {item} costs ${price}")
