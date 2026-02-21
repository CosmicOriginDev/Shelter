# INITIAL VARIABLES

# Empty list for all the available shelters.
shelters = []


########################################################################################
# FUNCTIONS

# Function to add a shelter
def add_shelter(shelter_name, shelter_address, max_cap):
    shelter = {
        "Shelter Name": shelter_name,
        "Shelter Address": shelter_address,
        "Max Capacity": max_cap,
        "Current Capacity": 0
    }
    shelters.append(shelter)

# Function to remove a shelter
def remove_shelter(shelter_name):
    for shelter in shelters:
        if shelter["Shelter Name"] == shelter_name:
            shelters.remove(shelter)
            break
    else:
        print("Invalid shelter name. No shelter removed.")

# Function to update people in shelter
def update_people_in_shelter(shelter_name, num_people):
    for shelter in shelters:
        if shelter["Shelter Name"] == shelter_name:
            if num_people <= shelter["Max Capacity"]:
                shelter["Current Capacity"] = num_people
            else:
                print("Number of people exceeds max capacity.")
            break
    else:
        print("Invalid shelter name.")

# Function to update shelter's max capacity
def update_max_capacity(shelter_name, new_max_capacity):
    for shelter in shelters:
        if shelter["Shelter Name"] == shelter_name:
            shelter["Max Capacity"] = new_max_capacity
            break
    else:
        print("Invalid shelter name.")


########################################################################################
# UNIT TESTING

add_shelter("Shelter A", "123 Main St.", 100)
add_shelter("Shelter B", "69 Pepping Spaghetti St.", 69)
print(shelters) # Prints the list of shelters to verify they were added correctly.

remove_shelter("Shelter A")
print(shelters) # Prints the list of shelters to verify Shelter A was removed correctly.

update_people_in_shelter("Shelter B", 50)
print(shelters) # Prints the list of shelters to verify the current capacity of Shelter B was updated correctly.

update_people_in_shelter("Shelter B", 70) # Should print an error message about exceeding max capacity.

update_max_capacity("Shelter B", 80)
print(shelters) # Prints the list of shelters to verify the max capacity of Shelter B was updated correctly.


