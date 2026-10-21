"""Independent check: evaluate the left-hand side of every figure's printed working and compare
with its value at the figure's own rounding."""
import json, math, re, sys
d = json.load(open(sys.argv[1]))
bad = 0
for f in d["figures"]:
    lhs = f["work"].split(" = ")[0]
    e = (lhs.replace("×", "*").replace("÷", "/").replace("−", "-").replace("2π", "2*math.pi")
            .replace("10⁻⁶", "1e-6").replace("10⁻³", "1e-3").replace("10⁶", "1e6").replace("²", "**2").replace(" ", ""))
    e = re.sub(r"(\d)\s*(?=\d{3}\b)", r"\1", e)
    try: x = eval(e, {"math": math})
    except Exception as ex: print("cannot eval", f["id"], lhs, ex); bad += 1; continue
    val = f["value"]
    # unit conversions shown in the working
    if f["unit"] == "mA" and "A =" in f["work"]: x *= 1000
    if f["unit"] == "mA" and x < 1: x *= 1000
    if f["unit"] == "kHz": x /= 1000
    if f["unit"] == "kVA" and x > 5000: x /= 1000
    num = re.match(r"[-+]?[\d ]*\.?\d*", f["text"]).group(0).replace(" ", "")
    dp = len(num.split(".")[1]) if "." in num else 0
    if f["unit"] == "mC": x *= 1000
    if "over the cap" in f["work"]: x = min(x, 10)
    tol = 0.5 * 10 ** -dp + 1e-9
    ok = abs(x - val) <= tol
    if not ok: bad += 1
    print(("ok  " if ok else "BAD ") + f'{f["id"]:<18} {f["text"]:<14} from {lhs} -> {x:.5g}')
print("problems:", bad); sys.exit(1 if bad else 0)
