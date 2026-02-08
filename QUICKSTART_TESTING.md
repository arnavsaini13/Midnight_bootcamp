# Quick Start Guide: Testing Working Compact Examples

## Setup Compact Compiler (v0.28.0)

### 1. Install Compact Version Manager

```bash
# Download and install
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/download/compact-v0.4.0/compact-installer.sh | sh

# Add to PATH (run this or restart terminal)
source $HOME/.local/bin/env

# On Windows WSL:
# Add this line to ~/.bashrc or ~/.zshrc
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### 2. Install Compiler

```bash
# Install version 0.28.0 (used by current examples)
compact update 0.28.0

# Verify installation
compact --version  # Should show: compact 0.4.0
compact list       # Should show 0.28.0 available

# Select version (if multiple installed)
compact select 0.28.0
```

---

## Option 1: Clone and Test Official Examples

### Example Counter (Simplest)

```bash
# Clone the repository
git clone https://github.com/midnightntwrk/example-counter.git
cd example-counter

# Install dependencies
npm install

# Build the contract
cd contract
npm run compact    # Compiles the .compact file
npm run build      # Generates TypeScript bindings
npm run test       # Run tests

# Expected output:
# Compiling 1 circuits:
#   circuit "increment" (k=10, rows=29)
```

### Example Bulletin Board (More Complex)

```bash
# Clone
git clone https://github.com/midnightntwrk/example-bboard.git
cd example-bboard

# Install root and API dependencies
npm install
cd api && npm install && cd ..

# Compile contract
cd contract
npm install
npm run compact    # Compiles bboard.compact
npm run build      # Generates bindings

# Expected output:
# Compiling 2 circuits:
#   circuit "post" (k=14, rows=10070)
#   circuit "takeDown" (k=14, rows=10087)
```

### OpenZeppelin Contracts (Production-Ready)

```bash
# Clone
git clone https://github.com/OpenZeppelin/compact-contracts.git
cd compact-contracts

# Install dependencies
npm install

# Build all contracts
cd contracts
npm run compile

# Expected: Multiple token contracts compile successfully
```

---

## Option 2: Compile Individual Files

### Basic Compilation

```bash
# Syntax:
# compact compile <language-version> <input-file> <output-dir>

# Example with language version 0.20.0
compact compile +0.20.0 my-contract.compact ./build

# Example with language version 0.16.0
compact compile +0.16.0 my-contract.compact ./build

# WSL users (from Windows path):
wsl -e bash -c "cd /mnt/c/your/path && compact compile +0.20.0 contract.compact ./build"
```

### Compile with Specific Circuit Size

```bash
# If you get circuit size errors, specify k parameter
compact compile +0.20.0 --k=14 contract.compact ./build

# Common k values:
# k=10: Small circuits (simple operations)
# k=11: Medium circuits
# k=14: Large circuits (complex operations, used by bboard)
```

---

## Testing Your Own Contract

### 1. Create a Simple Test Contract

Create `test-counter.compact`:
```compact
pragma language_version >= 0.20;
import CompactStandardLibrary;

export ledger counter: Uint<64>;

constructor(initial: Uint<64>) {
  counter = disclose(initial);
}

export circuit increment(): [] {
  counter = disclose(counter + 1 as Uint<64>);
}

export circuit getCounter(): Uint<64> {
  return counter;
}
```

### 2. Compile It

```bash
# Create output directory
mkdir -p ./build

# Compile
compact compile +0.20.0 test-counter.compact ./build

# Check for success - should see:
# Compiling X circuits:
#   circuit "increment" (k=X, rows=X)
#   circuit "getCounter" (k=X, rows=X)
```

### 3. Check Output

```bash
# List generated files
ls -la ./build/

# Should see:
# - test-counter-contract.compact (compiled contract)
# - Various .zkasm and other circuit files
```

---

## Common Compilation Issues & Fixes

### Issue: "compact: command not found"

**Fix:**
```bash
# Reload PATH
source $HOME/.local/bin/env

# Or add permanently to shell config
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Issue: "No such file or directory"

**Fix:**
```bash
# WSL users: Ensure you're in the right directory
pwd  # Check current directory
cd /mnt/c/your/project/path

# Verify file exists
ls -la *.compact
```

### Issue: "Parse error" or "Syntax error"

**Fix:**
- Check file syntax against working examples
- Ensure `pragma language_version` is first line
- Verify you're using correct language version
- See SYNTAX_FIXES.md for common mistakes

### Issue: "Circuit size too large"

**Fix:**
```bash
# Increase k parameter
compact compile +0.20.0 --k=14 contract.compact ./build

# Or simplify your circuit (reduce complexity)
```

### Issue: "Cannot find module 'CompactStandardLibrary'"

**Fix:**
- Ensure first line is: `pragma language_version >= 0.20;`
- Second line should be: `import CompactStandardLibrary;`
- No typos in import statement

---

## Quick Verification Commands

### Check Installed Versions
```bash
compact --version          # Version manager version
compact list               # List installed compiler versions
compact list --available   # List all available versions
```

### Syntax Check (Fast)
```bash
# Just check syntax without full compilation
compact check my-contract.compact
```

### Get Compiler Info
```bash
# Show detailed info about a version
compact info 0.28.0
```

---

## Recommended Workflow

### For Learning:

1. **Start with example-counter**
   ```bash
   git clone https://github.com/midnightntwrk/example-counter.git
   cd example-counter
   # Study contract/src/counter.compact
   ```

2. **Modify and test**
   - Make small changes to counter.compact
   - Run `npm run compact` to verify it compiles
   - Learn from compilation errors

3. **Move to example-bboard**
   - More complex patterns
   - Multiple circuits
   - Privacy features

### For Your DAO Project:

1. **Use working template from SYNTAX_FIXES.md**
   - Copy the complete template
   - Save as `dao-treasury.compact`

2. **Start minimal, add features incrementally**
   ```compact
   // Step 1: Basic state only
   pragma language_version >= 0.20;
   import CompactStandardLibrary;
   
   export ledger treasuryBalance: Uint<128>;
   
   constructor(initial: Uint<128>) {
     treasuryBalance = disclose(initial);
   }
   ```

3. **Test after each addition**
   ```bash
   compact compile +0.20.0 dao-treasury.compact ./build
   ```

4. **Add features one at a time**
   - First: Basic deposit/withdraw circuits
   - Then: Member registration
   - Then: Proposal creation
   - Then: Voting
   - Finally: Execution

---

## Testing with Full Stack

If you want to test with UI/CLI (once contract compiles):

### 1. Copy example-counter structure
```bash
# Your project structure should be:
my-dao/
├── contract/
│   ├── src/
│   │   └── dao-treasury.compact
│   ├── package.json
│   └── tsconfig.json
└── cli/
    ├── src/
    └── package.json
```

### 2. Use example-counter as template
```bash
# Copy package.json and config files from example-counter
cp example-counter/contract/package.json my-dao/contract/
cp example-counter/contract/tsconfig.json my-dao/contract/

# Modify package.json to reference your contract file
```

### 3. Build and test
```bash
cd my-dao/contract
npm install
npm run compact  # Should compile successfully
npm run build    # Generates TypeScript bindings
```

---

## Helpful Resources

### Official Examples (All compile successfully)
- Simple: https://github.com/midnightntwrk/example-counter
- Complex: https://github.com/midnightntwrk/example-bboard
- Production: https://github.com/OpenZeppelin/compact-contracts

### Documentation
- Main docs: https://docs.midnight.network/
- Compact guide: https://docs.midnight.network/compact/writing
- API reference: https://docs.midnight.network/compact/lang-ref

### Community
- Discord: https://discord.com/invite/midnightnetwork
- Forum: https://forum.midnight.network/
- YouTube: https://www.youtube.com/@midnight.network

---

## Quick Test Checklist

Before asking for help, verify:

- [ ] Compact version manager installed: `compact --version`
- [ ] Compiler version installed: `compact list` shows 0.28.0
- [ ] File starts with `pragma language_version >= 0.20;`
- [ ] Second line is `import CompactStandardLibrary;`
- [ ] Using `export ledger` for state variables (not `state`)
- [ ] Using `export circuit name(): Type { ... }` for functions
- [ ] Compilation command correct: `compact compile +0.20.0 file.compact ./build`
- [ ] Compared your syntax to working examples

---

## Example: Complete Compilation Session

```bash
# 1. Verify setup
compact --version
# Output: compact 0.4.0

compact list
# Output: 0.28.0 (active)

# 2. Create test file
cat > simple-test.compact << 'EOF'
pragma language_version >= 0.20;
import CompactStandardLibrary;

export ledger counter: Uint<64>;

constructor(initial: Uint<64>) {
  counter = disclose(initial);
}

export circuit increment(): [] {
  counter = disclose(counter + 1 as Uint<64>);
}

export circuit getCounter(): Uint<64> {
  return counter;
}
EOF

# 3. Compile
mkdir -p ./build
compact compile +0.20.0 simple-test.compact ./build

# 4. Success output:
# Compiling 2 circuits:
#   circuit "increment" (k=10, rows=XX)
#   circuit "getCounter" (k=10, rows=XX)

# 5. Verify output
ls -la ./build/
# Should show compiled files

echo "✅ Success! Contract compiled."
```

---

## Next Steps

1. ✅ Install compiler (if not done)
2. ✅ Clone and test example-counter
3. ✅ Modify example slightly and recompile
4. ✅ Try compiling the template from SYNTAX_FIXES.md
5. ✅ Build your DAO treasury incrementally
6. ✅ Test each feature as you add it

Happy coding! 🚀

For working code examples, see:
- WORKING_COMPACT_EXAMPLES.md
- SYNTAX_FIXES.md (for your specific issues)
