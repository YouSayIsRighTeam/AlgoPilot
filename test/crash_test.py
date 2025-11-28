
def cause_zero_division(n): # Case 1: Division by Zero
    print(f"Calculating 100 / {n}...")
    return 100 / n

def cause_recursion_error(n): # Case 2: Recursion Error (Stack Overflow)
    if n == 1000000:
        return n
    return n + cause_recursion_error(n + 1)

def cause_index_error(): # Case 3: Index Error
    arr = [1, 2, 3]
    return arr[10]

def main():
    print("Starting Crash Test...")
    
    # --- Uncomment one of the following lines to test different crashes ---
    
    cause_zero_division(0)
    # cause_recursion_error(0)
    # cause_index_error()

if __name__ == "__main__":
    main()
