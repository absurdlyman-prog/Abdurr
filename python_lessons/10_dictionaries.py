# ============================================================
# LESSON 10: Dictionaries
# ============================================================
# A dictionary stores key-value pairs.
# Keys must be unique and immutable (strings, numbers, tuples).
# Values can be anything.

person = {
    "name":   "Abdurr",
    "age":    20,
    "city":   "Lagos",
    "skills": ["Python", "Math"]
}

print(person)

# ---- ACCESSING VALUES ----
print(person["name"])          # Abdurr
print(person.get("age"))       # 20
print(person.get("email"))     # None (no error if key missing)
print(person.get("email", "N/A"))  # default value

# ---- ADDING & UPDATING ----
person["email"] = "abdurr@email.com"   # add new key
person["age"]   = 21                   # update existing key
print(person)

# ---- REMOVING ----
removed = person.pop("city")           # remove key and return value
print("Removed:", removed)
del person["email"]                    # delete key
print(person)

# ---- CHECKING KEYS ----
print("name" in person)       # True
print("salary" in person)     # False

# ---- ITERATING ----
grades = {"Math": 90, "English": 85, "Science": 92}

for key in grades:
    print(key, "->", grades[key])

for key, value in grades.items():
    print(f"{key}: {value}")

for key in grades.keys():
    print(key)

for value in grades.values():
    print(value)

# ---- USEFUL METHODS ----
print(len(grades))            # number of key-value pairs
print(list(grades.keys()))    # ['Math', 'English', 'Science']
print(list(grades.values()))  # [90, 85, 92]

grades.update({"Art": 88, "Math": 95})   # add/update multiple
print(grades)

# ---- DICT COMPREHENSION ----
squares = {x: x**2 for x in range(1, 6)}
print(squares)   # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Filter: only even squares
even_squares = {k: v for k, v in squares.items() if v % 2 == 0}
print(even_squares)

# ---- NESTED DICTIONARIES ----
students = {
    "Alice": {"age": 20, "grade": "A"},
    "Bob":   {"age": 22, "grade": "B"},
}

print(students["Alice"]["grade"])   # A

for student, info in students.items():
    print(f"{student}: age {info['age']}, grade {info['grade']}")

# ---- setdefault() ----
# Sets a key only if it doesn't already exist
person.setdefault("country", "Nigeria")
person.setdefault("name", "Nobody")   # won't overwrite existing
print(person)

# ---- Counting with a dict ----
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
count = {}
for word in words:
    count[word] = count.get(word, 0) + 1
print(count)   # {'apple': 3, 'banana': 2, 'cherry': 1}

# ============================================================
# EXERCISES
# ============================================================
# 1. Create a phonebook dict with 3 contacts.
#    Let the user search a name and print the number.
# 2. Given a sentence, count how many times each letter appears.
# 3. Invert a dictionary: {1:"a", 2:"b", 3:"c"} → {"a":1, "b":2, "c":3}
