# ============================================================
# LESSON 14: File I/O (Reading & Writing Files)
# ============================================================
# Python can read from and write to files on your computer.

# ---- WRITING A FILE ----
# open(filename, mode)
# Modes:  "w" = write (creates/overwrites)
#         "a" = append (adds to end)
#         "r" = read (default)
#         "x" = create new (error if already exists)
# Add "b" for binary mode, e.g. "rb", "wb"

with open("sample.txt", "w") as f:
    f.write("Line 1: Hello, World!\n")
    f.write("Line 2: Python file I/O\n")
    f.write("Line 3: Learning is fun!\n")

# The 'with' statement automatically closes the file afterwards.
print("File written successfully.")

# ---- READING A FILE ----

# Read entire file as one string
with open("sample.txt", "r") as f:
    content = f.read()
print(content)

# Read line by line into a list
with open("sample.txt", "r") as f:
    lines = f.readlines()   # ['Line 1...\n', 'Line 2...\n', ...]
print(lines)

# Iterate line by line (memory efficient for large files)
with open("sample.txt", "r") as f:
    for line in f:
        print(line.strip())   # .strip() removes the trailing \n

# Read one line at a time
with open("sample.txt", "r") as f:
    first  = f.readline()
    second = f.readline()
print(first.strip())
print(second.strip())

# ---- APPENDING TO A FILE ----
with open("sample.txt", "a") as f:
    f.write("Line 4: Appended line!\n")

with open("sample.txt", "r") as f:
    print(f.read())

# ---- WRITING MULTIPLE LINES WITH writelines() ----
lines_to_write = [
    "Alpha\n",
    "Beta\n",
    "Gamma\n",
]
with open("greek.txt", "w") as f:
    f.writelines(lines_to_write)

# ---- CHECKING IF A FILE EXISTS ----
import os

if os.path.exists("sample.txt"):
    print("sample.txt exists")

print("File size:", os.path.getsize("sample.txt"), "bytes")

# ---- DELETING A FILE ----
# os.remove("file.txt")     # deletes file
# os.rmdir("empty_folder")  # deletes empty folder

# ---- WORKING WITH CSV FILES ----
import csv

# Write CSV
with open("students.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["Name", "Age", "Grade"])   # header
    writer.writerow(["Alice", 20, "A"])
    writer.writerow(["Bob",   22, "B"])
    writer.writerow(["Carol", 21, "A"])

# Read CSV
with open("students.csv", "r") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)

# Read CSV as dictionaries (header = keys)
with open("students.csv", "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(f"{row['Name']} is {row['Age']} years old, grade {row['Grade']}")

# ---- WORKING WITH JSON FILES ----
import json

data = {
    "name": "Abdurr",
    "age": 20,
    "skills": ["Python", "Math", "Logic"],
    "active": True
}

# Write JSON
with open("data.json", "w") as f:
    json.dump(data, f, indent=4)

# Read JSON
with open("data.json", "r") as f:
    loaded = json.load(f)

print(loaded)
print(type(loaded))             # <class 'dict'>
print(loaded["skills"])         # ['Python', 'Math', 'Logic']

# ---- Clean up demo files ----
for fname in ["sample.txt", "greek.txt", "students.csv", "data.json"]:
    if os.path.exists(fname):
        os.remove(fname)

# ============================================================
# EXERCISES
# ============================================================
# 1. Create a to-do list app that saves tasks to a file.
#    - "add <task>"  → append task to tasks.txt
#    - "list"        → print all tasks
#    - "quit"        → exit
# 2. Read a CSV of products (name, price) and print the
#    most expensive product.
# 3. Save a dictionary as JSON, then load it and pretty-print it.
