#!/usr/bin/env python3
"""Every lesson's figures live here: add them to this script and regenerate; never edit case.json by hand (it is rebuilt from this file).
Builds build/electrical/subsea-cable-testing/case.json: every figure is worked here from the
inputs shown with it, rounded half up, and the script asserts the arithmetic as it goes."""
import json, math, sys
from decimal import Decimal, ROUND_HALF_UP

OUT = sys.argv[1]
TITLE = "HV Subsea Cable Testing"

def rnd(x, dp):
    q = Decimal(1).scaleb(-dp)
    return float(Decimal(repr(x)).quantize(q, rounding=ROUND_HALF_UP))

def fmt(x, dp):
    return f"{rnd(x, dp):,.{dp}f}".replace(",", " ") if abs(x) >= 10000 else f"{rnd(x, dp):.{dp}f}"

givens, assumptions, figures, toResearch = [], [], [], []

def G(id, label, value, cite, unit=None, text=None, practice=False, note=None, check=None):
    g = {"id": id, "label": label, "value": value}
    if unit: g["unit"] = unit
    g["text"] = text if text is not None else (f"{value} {unit}" if unit else str(value))
    if practice: g["practice"] = True
    g["cite"] = cite
    if note: g["note"] = note
    if check: g["check"] = check
    givens.append(g)

def A(id, label, why, value=None, unit=None):
    a = {"id": id, "label": label}
    if value is not None: a["value"] = value
    if unit: a["unit"] = unit
    a["why"] = why
    a["status"] = "assumption"
    a["text"] = "Assumed: " + label + ". " + why
    assumptions.append(a)

def F(id, label, value, dp, unit, rule, inputs, work, cite, lesson, kind="worked", part=None,
      practice=False, accept=None, note=None):
    v = rnd(value, dp)
    f = {"id": id, "label": label, "value": v, "unit": unit, "rule": rule, "inputs": inputs,
         "cite": cite, "kind": kind, "status": "worked", "lesson": lesson}
    if part: f["part"] = part
    if practice: f["practice"] = True
    if accept: f["accept"] = accept
    if note: f["note"] = note
    f["text"] = (fmt(value, dp) + unit) if unit == "%" else f"{fmt(value, dp)} {unit}".strip()
    f["work"] = work.replace("{=}", f["text"])
    figures.append(f)
    return v

PV = "practice value (the running case is made up for practice; no real wind farm)"

# ---------------------------------------------------------------- givens from his notes
G("n.route", "Inter-array cable", "AC, turbine to offshore substation", "notes p.1")
G("n.export", "Export cable", "offshore substation to onshore substation", "notes p.1")
G("n.voltages", "Typical voltages (added background)", "array 33 kV or 66 kV; export roughly 132-275 kV AC",
  "notes p.1 (➕ added background, a claim to check)", check="maker brochures (Prysmian 66 kV, NKT, ABB)")
G("n.layers", "Core build, middle out (added background)",
  "conductor; inner semi-con; XLPE; outer semi-con; metallic screen; aluminium foil; oversheath",
  "notes p.1 (➕ added background, a claim to check)", check="a maker's three-core submarine cable data sheet; the notes leave out the armour and lead sheath that their LIRA part names")
G("n.body", "Body natural resistance", 10000, "notes p.1", unit="Ω", text="about 10 000 Ω at 55 V")
G("n.fatal", "Potentially fatal current", 50, "notes p.1", unit="mA", text="50 mA or above")
G("n.confirm", "Confirm before testing", "Identify, Isolated, Proved dead, Secured, Earthed", "notes p.2")
G("n.colours", "Phase colours", "Red L1, Yellow L2, Blue L3", "notes p.2")
G("n.lowR", "Low resistance", 1, "notes p.2", unit="Ω", text="under 1 Ω")
G("n.tol", "Core resistance against factory values", 2, "notes p.3", unit="%", text="within 2%")
G("n.cuTemp", "Copper resistance with temperature (added background)", 0.4, "notes p.3 (➕ added background, a claim to check)",
  unit="% per °C", text="about 0.4% per °C", check="IEC 60228 temperature correction (Annex B), or a maker's data")
G("n.loopRule", "Cores from loops", "L1 = (A + C − B) ÷ 2; L2 = (B + A − C) ÷ 2; L3 = (C + B − A) ÷ 2", "notes p.3")
G("n.wexA", "Worked example loop L1-L2", 76.90, "notes p.3", unit="mΩ", text="76.90 mΩ")
G("n.wexB", "Worked example loop L2-L3", 80.49, "notes p.3", unit="mΩ", text="80.49 mΩ")
G("n.wexC", "Worked example loop L3-L1", 81.16, "notes p.3", unit="mΩ", text="81.16 mΩ")
G("n.discharge", "Discharge after an IR test", 5, "notes p.3", unit="× charging time", text="at least 5 × the charging time")
G("n.pi", "PI bands", "<1 poor; 1-2 questionable; 2-4 okay; >4 good", "notes p.4")
G("n.dar", "DAR bands", "<1.25 inadequate; 1.25-1.6 satisfactory; >1.6 excellent", "notes p.4")
G("n.sheath", "Sheath test", "4 kV per mm of sheath thickness, maximum 10 kV, for 1 minute, screen to earth", "notes p.4")
G("n.liraPairs", "LIRA test regime", "18 tests, typically core to screen and core to core, bi-directional; no acceptance criteria", "notes p.5")
G("n.liraOnline", "LIRA online monitoring", 33, "notes p.5", unit="kV", text="energised cables up to 33 kV")
G("n.dnorm", "DNORM sign", "negative: thermal degradation, water penetration, mechanical; positive: bends, breaks in the shield", "notes p.6")
G("n.dnormCol", "DNORM severity", "green mild; amber intermediate; red significant", "notes p.6")
G("n.vlfF", "VLF frequencies", "0.1 Hz standard; 0.01 Hz also used", "notes p.6, p.7", text="0.1 Hz (0.01 Hz also used)")
G("n.vlfU", "VLF test voltage range", "1.5-2.5 U0", "notes p.7 (contested: see toResearch r.vlfU)")
G("n.vlf30", "Simple withstand", 30, "notes p.7", unit="min", text="30 min at 0.1 Hz")
G("n.vlf60", "Installation or acceptance", 60, "notes p.7", unit="min", text="60 min at 0.1 Hz")
G("n.u0ex", "U0 worked example (added background)", 12, "notes p.7 (➕ added background, a claim to check)", unit="kV", text="a 12/20 kV cable has U0 = 12 kV")
G("n.tdrRule", "TDR distance", "L = t × v ÷ 2", "notes p.7")
G("n.tdrAcc", "TDR accuracy", "±0-1% of cable length", "notes p.7")
G("n.tdrPulse", "TDR pulse amplitude", 50, "notes p.7", unit="V", text="fixed at 50 V")
G("n.tdrLimit", "Faults TDR can see", 100, "notes p.7", unit="Ω", text="under about 100 Ω (200 Ω for Teleflex)")
G("n.vfEx", "Velocity error example (added background)", "2 km cable, 5% VF error: 100 m out", "notes p.7 (➕ added background, a claim to check)")
G("n.traces", "TDR trace shapes", "up = open; down = short; small up-down = joint; down then broad hump = T joint; up then dip = bridge tap; sharp up-down = wet splice; ragged tail = water ingress", "notes p.8")

# ---------------------------------------------------------------- typical values to quote (research)
G("t.C66", "Capacitance per core, 66 kV three-core XLPE, 240 mm² (typical)", 0.22, unit="µF/km", text="0.22 µF/km",
  cite="ABB, XLPE Submarine Cable Systems (2GM5007), three-core 66 kV (Um 72.5 kV) table, 240 mm² row (quoted: research sources 87 and 88)",
  note="A typical published value, used until the case cable's own data sheet is quoted.")
G("t.Ich66", "Charging current per phase at 50 Hz, same row (typical)", 2.6, unit="A/km", text="2.6 A/km",
  cite="ABB, XLPE Submarine Cable Systems (2GM5007), same row: to research")
G("t.vfXLPE", "TDR velocity factor, power XLPE (typical range)", "0.54 to 0.62 (162 to 186 m/µs)",
  cite="Megger application note TDR_AN58 'Basic TDR operation', typical VFs: to research")
G("t.sheathIEC", "Oversheath test after installation", "4 kV d.c. per mm of specified thickness, maximum 10 kV d.c., 1 min, all metallic layers under the oversheath connected together",
  cite="IEC 60229:2007 clause 5 (public preview): to research")

# ---------------------------------------------------------------- the running case: practice values
G("p.farm", "The job", "commissioning tests on string B of an offshore wind farm", cite=PV, practice=True)
G("p.cable", "The cable", "B01 to the offshore substation (OSS): the string's last cable", cite=PV, practice=True)
G("p.len", "Route length, B01 to OSS (installation record)", 2.40, unit="km", text="2.40 km", cite=PV, practice=True)
G("p.design", "Cable", "three-core, 3 × 240 mm² copper, XLPE, 38/66 (72.5) kV, copper wire screens, armoured", cite=PV, practice=True,
  note="Some makers write 36/66 kV. Read U0 off the cable's own data sheet.")
G("p.U0", "U0, phase to earth", 38, unit="kV", text="38 kV", cite=PV, practice=True,
  note="A maker names this rating 38/66 (72.5) kV (research source 196); another maker's table pairs a highest voltage of 72.5 kV with U0 = 36 kV (source 197). ABB's 2.6 A/km at 0.22 µF/km implies about 38 kV. Read U0 off the cable's own data sheet.")
G("p.induce", "Voltage induced on an isolated B core by string A's load, per km", 40, unit="V/km", text="40 V/km", cite=PV, practice=True,
  note="Only to give lesson 1's coupling picture a number. The real value comes from the CIGRE guideline's calculation (inductive coupling grows with the neighbour's current, closeness and length of parallelism, not its voltage: research sources 175-176), and a fault on string A would give kilovolts, not volts. For a screened core the coupling that matters is inductive (source 179), so no capacitive coupling ratio is set.")
G("p.joint", "Field joint, from the OSS end (installation record)", 1620, unit="m", text="1620 m", cite=PV, practice=True)
G("p.temp", "Cable temperature at test", 12, unit="°C", text="12 °C", cite=PV, practice=True)
G("p.fac1", "Factory core resistance L1 at 20 °C", 174.70, unit="mΩ", text="174.70 mΩ", cite=PV + "; from the factory test certificate", practice=True,
  note="Real values come from the factory test certificate. For scale: a copper class 2 conductor of 240 mm² is limited to 0.0754 Ω/km at 20 °C (research sources 213-214), which is 181 mΩ over 2.40 km, and these sit about 3% under that.")
G("p.fac2", "Factory core resistance L2 at 20 °C", 174.90, unit="mΩ", text="174.90 mΩ", cite=PV + "; from the factory test certificate", practice=True,
  note="Real values come from the factory test certificate. For scale: a copper class 2 conductor of 240 mm² is limited to 0.0754 Ω/km at 20 °C (research sources 213-214), which is 181 mΩ over 2.40 km, and these sit about 3% under that.")
G("p.fac3", "Factory core resistance L3 at 20 °C", 174.60, unit="mΩ", text="174.60 mΩ", cite=PV + "; from the factory test certificate", practice=True,
  note="Real values come from the factory test certificate. For scale: a copper class 2 conductor of 240 mm² is limited to 0.0754 Ω/km at 20 °C (research sources 213-214), which is 181 mΩ over 2.40 km, and these sit about 3% under that.")
G("p.loopA", "Loop L1-L2 (A)", 339.31, unit="mΩ", text="339.31 mΩ", cite=PV + "; DLRO reading", practice=True)
G("p.loopB", "Loop L2-L3 (B)", 339.21, unit="mΩ", text="339.21 mΩ", cite=PV + "; DLRO reading", practice=True)
G("p.loopC", "Loop L1-L3 (C)", 338.32, unit="mΩ", text="338.32 mΩ", cite=PV + "; DLRO reading", practice=True)
G("p.dlroRange", "DLRO10HD range for the loops", "1 A, 0 to 2.5 Ω (the 10 A range stops at 250 mΩ)", cite=PV, practice=True,
  note="A loop of about 340 mΩ is beyond the 10 A range's 250 mΩ, so it sits on the 1 A range at 2.5 W (Megger DLRO10HD data sheet, research sources 198, 201 and 202). Read the range off the instrument in use.")
G("p.leadR", "Resistance of each current (C) lead", 30, unit="mΩ", text="30 mΩ", cite=PV, practice=True,
  note="Only so lesson 2's picture can show what a two-wire reading would add. Real leads vary; the DLRO10HD data sheet gives a maximum lead resistance of under 100 mΩ at 10 A (research source 220).")
G("p.contactR", "Contact resistance at each current (C) clamp", 15, unit="mΩ", text="15 mΩ", cite=PV, practice=True,
  note="Only so lesson 2's picture can show what joins the reading when a P probe sits outside its C clamp. A real clamp on a clean termination is lower or higher by the day.")
G("p.irV", "IR test voltage", 5, unit="kV d.c.", text="5 kV d.c.", cite=PV + "; the client's test specification", practice=True)
G("p.irCrit", "Client's IR criterion", 1, unit="GΩ", text="at least 1 GΩ at 1 minute", cite=PV + "; the client's test specification", practice=True)
for core, r30, r1, r10 in (("1", 18.0, 24.0, 62.0), ("2", 2.10, 2.20, 2.40), ("3", 17.5, 23.0, 60.0)):
    G(f"p.ir{core}.30s", f"L{core} IR at 30 s", r30, unit="GΩ", text=f"{r30:.2f} GΩ" if r30 < 10 else f"{r30:.1f} GΩ", cite=PV, practice=True)
    G(f"p.ir{core}.1m", f"L{core} IR at 1 min", r1, unit="GΩ", text=f"{r1:.2f} GΩ" if r1 < 10 else f"{r1:.1f} GΩ", cite=PV, practice=True)
    G(f"p.ir{core}.10m", f"L{core} IR at 10 min", r10, unit="GΩ", text=f"{r10:.2f} GΩ" if r10 < 10 else f"{r10:.1f} GΩ", cite=PV, practice=True)
G("p.piTime", "PI test duration", 10, unit="min", text="10 min", cite="notes p.4 (PI is the 10-minute reading over the 1-minute reading)")
G("p.sheathT", "Core oversheath, specified thickness", 2.2, unit="mm", text="2.2 mm", cite=PV + "; the cable data sheet", practice=True)
G("p.sheathL2", "L2 sheath result", "the test set tripped at 3.2 kV after 20 s; L1 and L3 held for 1 minute", cite=PV, practice=True)
G("p.vlfSpec", "VLF test in the client's specification", "2 U0, sinusoidal, 0.1 Hz, 60 min, each core", cite=PV + "; inside the notes' 1.5-2.5 U0 (notes p.7)", practice=True)
G("p.vlfL2", "L2 VLF result", "broke down at minute 12; L1 and L3 held 60 min", cite=PV, practice=True)
G("p.Rf", "L2 core to screen after the breakdown", 35, unit="Ω", text="35 Ω", cite=PV, practice=True)
G("p.tEnd", "TDR, end of cable, open, from the OSS", 28.57, unit="µs", text="28.57 µs", cite=PV + "; TDR reading", practice=True)
G("p.tFault", "TDR, downward peak on L2, from the OSS", 11.43, unit="µs", text="11.43 µs", cite=PV + "; TDR reading", practice=True)
G("p.liraOSS", "LIRA spot on L2, from the OSS end", 961, unit="m", text="961 m, DNORM negative, red", cite=PV + "; LIRA reading", practice=True)
G("p.liraB01", "LIRA spot on L2, from the B01 end", 1441, unit="m", text="1441 m, DNORM negative, red", cite=PV + "; LIRA reading", practice=True)

# ---------------------------------------------------------------- assumptions
A("a.alpha", "Copper's resistance rises 0.00393 of its 20 °C value per °C",
  "Linear rule R_t = R20 × (1 + 0.00393 × (t − 20)). The notes say about 0.4% per °C; Quoted: the standard temperature coefficient of copper is 0.00393 per °C at 20 °C (NIST copper wire tables, research source 210), and IEC 60228 has the measured resistance corrected to 20 °C by the factors in its Table A.1 (source 211). The linear form is the course's own working from that coefficient.",
  value=0.00393, unit="per °C")
A("a.phaseOrder", "Phase ID: each core is tested to the screen in turn, with only that core joined to the screen at the far end",
  "The notes say the cable is earthed at both ends to start, with conductor and screen disconnected and a technician at each end, and that each core is proved by a core-to-screen continuity test from both ends (p.2). A utility's procedure tests each conductor in turn using the screen as the return (research: SSEN 9.1). No source found gives the earthing order, so the lesson assumes: every core earthed at both ends to start; the far end keeps one core joined to the screen through its earth and lifts the other two under control; your end lifts its earths under control and tests each core to the screen, and only the joined core reads continuity; the earths go back on, and the ends swap.")
A("a.chargeTime", "The 'charging time' in the 5× discharge rule is the time the test voltage was applied",
  "The notes do not say. Research must quote the test-set maker's discharge guidance.")
A("a.order", "The tests run in the order of the notes' test sequence",
  "Phase ID, core resistance, IR with PI and DAR, sheath, VLF, then LIRA (notes p.9, added background). TDR comes in when the VLF test breaks down.")
A("a.vlfAfterSheath", "The client asks for the VLF test on all three cores despite L2's sheath result",
  "A story choice so one fault shows up in four tests. On a real job the engineer stops and reports first (notes p.10: figure out why before submitting).")
A("a.semicon", "The core oversheaths are semi-conductive",
  "So the positive lead goes to the sheath's semi-con layer through the roll spring (notes p.4). Read it off the cable data sheet.")
A("a.trapped", "Worst case trapped charge: switched off at the peak of U0",
  "A de-energised cable can be left charged. The case works the most it could hold. Sourced: 'trapped charge' left on the capacitance of equipment, for example after insulation resistance testing a length of cable (IET Wiring Matters, research source 186); high-voltage cables are to be treated as capacitors that store energy (source 188); E = ½CV² (source 191). The peak-of-U0 worst case itself is the course's own.")
A("a.vCal", "The TDR velocity is set from the known route length",
  "The open-end reflection and the 2.40 km installation record give v (Megger TDR_AN58: test a known length and adjust the VF).")

# ---------------------------------------------------------------- figures
L = 2.40; C_km = 0.22; U0 = 38000.0; w50 = 2 * math.pi * 50

# Lesson 1
F("l1.recall", "Recall: body current at 55 V through 10 000 Ω", 55 / 10000 * 1000, 2, "mA", "I = V ÷ R",
  {"V": "55 V", "R": "10 000 Ω"}, "55 ÷ 10 000 = 0.0055 A = {=}", "notes p.1", "i1")
F("l1.recall.slip1", "Recall slip: 10 000 Ω read as 1000 Ω", 55 / 1000 * 1000, 2, "mA", "I = V ÷ R",
  {"V": "55 V", "R": "1000 Ω"}, "55 ÷ 1000 = {=}", "notes p.1 (the rule it breaks)", "i1", kind="slip")
C = F("1a", "Capacitance of one core, B01 to OSS", C_km * L, 3, "µF", "C = C per km × length",
      {"C per km": "0.22 µF/km", "length": "2.40 km"}, "0.22 × 2.40 = {=}", "t.C66 (to research); p.len", "i1", kind="case", part="1a", practice=True)
E = F("1b", "Most energy one core could hold if switched off at the peak", C * 1e-6 * U0 ** 2, 2, "J",
      "E = ½ × C × (√2 × U0)² = C × U0²", {"C": "0.528 µF", "U0": "38 kV"},
      "0.528 × 10⁻⁶ × 38 000² = {=}", "a.trapped; p.U0; 1a", "i1", kind="case", part="1b", practice=True,
      accept={"min": 762.0, "max": 762.9, "why": "unrounded working"})
F("1b.slip", "Slip: the peak left out (½ C U0²)", 0.5 * C * 1e-6 * U0 ** 2, 2, "J", "½ × C × U0²",
  {"C": "0.528 µF", "U0": "38 kV"}, "0.5 × 0.528 × 10⁻⁶ × 38 000² = {=}", "the rule it breaks", "i1", kind="slip")
F("l1.Ich", "Charging current of one core in service, 50 Hz", w50 * C * 1e-6 * U0, 2, "A", "I = 2πfC × U0",
  {"f": "50 Hz", "C": "0.528 µF", "U0": "38 kV"}, "2π × 50 × 0.528 × 10⁻⁶ × 38 000 = {=}", "AC circuits lesson 5; 1a; p.U0", "i1", practice=True,
  note="Cross-check: 2.6 A/km × 2.40 km = 6.24 A from the maker's table (t.Ich66).")
F("l1.Ich.check", "Charging current from the maker's per-km figure", 2.6 * L, 2, "A", "I = A/km × length",
  {"A/km": "2.6 A/km", "length": "2.40 km"}, "2.6 × 2.40 = {=}", "t.Ich66 (to research); p.len", "i1")
F("l1.induced", "Induced voltage on the isolated B core over the 2.40 km parallel run (illustration)", 40 * L, 0, "V", "V = V per km × parallel length",
  {"V per km": "40 V/km", "length": "2.40 km"}, "40 × 2.40 = {=}", "p.induce; p.len", "i1", practice=True,
  note="A practice value for the picture. It is why a dead cable beside a live string is proved dead and earthed, not a measurement.")
F("l1.changed", "Changed numbers: capacitance of a 1.80 km core at 0.22 µF/km", 0.22 * 1.80, 3, "µF", "C = C per km × length",
  {"C per km": "0.22 µF/km", "length": "1.80 km"}, "0.22 × 1.80 = {=}", "t.C66", "i1", practice=True)
# Lesson 1: the worked example, the pictures' readouts, the slips and the changed numbers, as lesson i1 shows them
Cw = F("l1.wex.C", "Worked example: capacitance of a 0.80 km core", C_km * 0.80, 3, "µF", "C = C per km × length",
       {"C per km": "0.22 µF/km", "length": "0.80 km"}, "0.22 × 0.80 = {=}", "t.C66; a practice length", "i1", practice=True)
assert Cw == 0.176
assert F("l1.wex.E", "Worked example: most energy in the 0.80 km core, off at the peak", Cw * 1e-6 * U0 ** 2, 2, "J",
         "E = ½ × C × (√2 × U0)² = C × U0²", {"C": "0.176 µF", "U0": "38 kV"}, "0.176 × 10⁻⁶ × 38 000² = {=}",
         "a.trapped; p.U0; l1.wex.C", "i1", practice=True) == 254.14
assert F("l1.wex.half", "Worked example: the peak left out (½ C U0²)", 0.5 * Cw * 1e-6 * U0 ** 2, 2, "J", "½ × C × U0²",
         {"C": "0.176 µF", "U0": "38 kV"}, "0.5 × 0.176 × 10⁻⁶ × 38 000² = {=}", "a.trapped; l1.wex.C", "i1", practice=True) == 127.07
C1 = rnd(C_km * 1.00, 3)
assert C1 == 0.22
assert F("l1.perkm", "Most energy one 1.00 km core could hold, off at the peak", C1 * 1e-6 * U0 ** 2, 2, "J",
         "E = ½ × C × (√2 × U0)² = C × U0²", {"C": "0.220 µF", "U0": "38 kV"}, "0.220 × 10⁻⁶ × 38 000² = {=}",
         "a.trapped; p.U0; t.C66", "i1", practice=True) == 317.68
assert F("l1.induced.short", "Induced voltage on the isolated B core over a 0.40 km parallel run (illustration)", 40 * 0.40, 0, "V",
         "V = V per km × parallel length", {"V per km": "40 V/km", "length": "0.40 km"}, "40 × 0.40 = {=}", "p.induce", "i1",
         practice=True, note="A practice value for the picture, like l1.induced, not a measurement.") == 16
assert F("1a.slip3", "Slip: all three cores counted", 3 * C, 3, "µF", "3 × C", {"C": "0.528 µF"}, "3 × 0.528 = {=}",
         "1a (the rule it breaks: each core is a capacitor of its own)", "i1", kind="slip") == 1.584
assert F("1a.slipDiv", "Slip: the length divided by the per-km figure", L / C_km, 2, "", "length ÷ C per km",
         {"length": "2.40 km", "C per km": "0.22 µF/km"}, "2.40 ÷ 0.22 = {=}", "1a (the rule it breaks)", "i1", kind="slip") == 10.91
assert F("1b.slip2", "Slip: the half left out (2 × C × U0²)", 2 * C * 1e-6 * U0 ** 2, 2, "J", "2 × C × U0²",
         {"C": "0.528 µF", "U0": "38 kV"}, "2 × 0.528 × 10⁻⁶ × 38 000² = {=}", "the rule it breaks", "i1", kind="slip") == 1524.86
Cc = rnd(0.22 * 1.80, 3)
assert Cc == 0.396
assert F("l1.changed.E", "Changed numbers: most energy in a 1.80 km core, off at the peak", Cc * 1e-6 * U0 ** 2, 2, "J",
         "E = ½ × C × (√2 × U0)² = C × U0²", {"C": "0.396 µF", "U0": "38 kV"}, "0.396 × 10⁻⁶ × 38 000² = {=}",
         "a.trapped; p.U0; l1.changed", "i1", practice=True) == 571.82
assert F("l1.changed.slip1", "Changed numbers slip: the peak left out", 0.5 * Cc * 1e-6 * U0 ** 2, 2, "J", "½ × C × U0²",
         {"C": "0.396 µF", "U0": "38 kV"}, "0.5 × 0.396 × 10⁻⁶ × 38 000² = {=}", "the rule it breaks", "i1", kind="slip") == 285.91
assert F("l1.changed.slip2", "Changed numbers slip: the half left out", 2 * Cc * 1e-6 * U0 ** 2, 2, "J", "2 × C × U0²",
         {"C": "0.396 µF", "U0": "38 kV"}, "2 × 0.396 × 10⁻⁶ × 38 000² = {=}", "the rule it breaks", "i1", kind="slip") == 1143.65

# Lesson 2: the notes' worked example
wa, wb, wc = 76.90, 80.49, 81.16
F("l2.recall", "Recall: L1 from the notes' worked example", (wa + wc - wb) / 2, 3, "mΩ", "L1 = (A + C − B) ÷ 2",
  {"A": "76.90 mΩ", "B": "80.49 mΩ", "C": "81.16 mΩ"}, "(76.90 + 81.16 − 80.49) ÷ 2 = 77.57 ÷ 2 = {=}", "notes p.3", "i2")
F("l2.recall.slip1", "Recall slip: the L2 formula used for L1", (wb + wa - wc) / 2, 3, "mΩ", "(B + A − C) ÷ 2",
  {"A": "76.90 mΩ", "B": "80.49 mΩ", "C": "81.16 mΩ"}, "(80.49 + 76.90 − 81.16) ÷ 2 = {=}", "notes p.3 (the rule it breaks)", "i2", kind="slip")
F("l2.recall.slip2", "Recall slip: half the L1-L2 loop", wa / 2, 2, "mΩ", "A ÷ 2", {"A": "76.90 mΩ"}, "76.90 ÷ 2 = {=}",
  "notes p.3 (the rule it breaks)", "i2", kind="slip")
F("l2.wex.L2", "Worked example: L2", (wb + wa - wc) / 2, 3, "mΩ", "L2 = (B + A − C) ÷ 2",
  {"A": "76.90", "B": "80.49", "C": "81.16"}, "(80.49 + 76.90 − 81.16) ÷ 2 = 76.23 ÷ 2 = {=}", "notes p.3", "i2")
F("l2.wex.L3", "Worked example: L3", (wc + wb - wa) / 2, 3, "mΩ", "L3 = (C + B − A) ÷ 2",
  {"A": "76.90", "B": "80.49", "C": "81.16"}, "(81.16 + 80.49 − 76.90) ÷ 2 = 84.75 ÷ 2 = {=}", "notes p.3", "i2",
  note="L3 reads about 9-11% above L1 and L2 in the notes' own example. Three cores of one cable should read close together, so this is the kind of deviation to explain before submitting (notes p.3).")
F("l2.wex.check", "Worked example check: (A + B + C) ÷ 2 = L1 + L2 + L3", (wa + wb + wc) / 2, 3, "mΩ", "(A + B + C) ÷ 2",
  {"A": "76.90", "B": "80.49", "C": "81.16"}, "(76.90 + 80.49 + 81.16) ÷ 2 = 238.55 ÷ 2 = {=} = 38.785 + 38.115 + 42.375", "notes p.3", "i2")
A_, B_, C_ = 339.31, 339.21, 338.32
c1 = F("l2.L1", "L1 core resistance at 12 °C", (A_ + C_ - B_) / 2, 2, "mΩ", "L1 = (A + C − B) ÷ 2",
       {"A": "339.31", "B": "339.21", "C": "338.32"}, "(339.31 + 338.32 − 339.21) ÷ 2 = {=}", "n.loopRule; p.loopA-C", "i2", practice=True)
c2 = F("2a", "L2 core resistance at 12 °C", (B_ + A_ - C_) / 2, 2, "mΩ", "L2 = (B + A − C) ÷ 2",
       {"A": "339.31", "B": "339.21", "C": "338.32"}, "(339.21 + 339.31 − 338.32) ÷ 2 = 340.20 ÷ 2 = {=}", "n.loopRule; p.loopA-C", "i2",
       kind="case", part="2a", practice=True)
c3 = F("l2.L3", "L3 core resistance at 12 °C", (C_ + B_ - A_) / 2, 2, "mΩ", "L3 = (C + B − A) ÷ 2",
       {"A": "339.31", "B": "339.21", "C": "338.32"}, "(338.32 + 339.21 − 339.31) ÷ 2 = {=}", "n.loopRule; p.loopA-C", "i2", practice=True)
k = 1 + 0.00393 * (12 - 20)
kk = F("l2.k", "Temperature factor at 12 °C", k, 5, "", "k = 1 + 0.00393 × (t − 20)", {"t": "12 °C"},
       "1 + 0.00393 × (12 − 20) = 1 − 0.03144 = {=}", "a.alpha (quoted: research sources 210-212); p.temp", "i2")
r20 = F("2b", "L2 corrected to 20 °C", c2 / kk, 2, "mΩ", "R20 = R_t ÷ k", {"R_t": "170.10 mΩ", "k": "0.96856"},
        "170.10 ÷ 0.96856 = {=}", "a.alpha (quoted: research sources 210-212); 2a", "i2", kind="case", part="2b", practice=True,
        accept={"min": 175.55, "max": 175.75, "why": "0.004 per °C (the notes' about 0.4%) gives 170.10 ÷ 0.968 = 175.72 mΩ"})
F("2c", "L2's deviation from its factory value", (r20 - 174.90) / 174.90 * 100, 2, "%", "(R20 − factory) ÷ factory × 100",
  {"R20": "175.62 mΩ", "factory": "174.90 mΩ"}, "(175.62 − 174.90) ÷ 174.90 × 100 = {=}, inside 2%: passes",
  "n.tol; p.fac2; 2b", "i2", kind="case", part="2c", practice=True,
  accept={"min": 0.40, "max": 0.48, "why": "the notes' about 0.4% per °C gives 175.72 mΩ and 0.47%; unrounded working gives 0.41%"})
figures[-1]["text"] = "+" + figures[-1]["text"]; figures[-1]["work"] = figures[-1]["work"].replace("= 0.41%,", "= +0.41%,")  # keep the direction
F("2c.slip", "Slip: compared without the temperature correction", (c2 - 174.90) / 174.90 * 100, 2, "%",
  "(R_t − factory) ÷ factory × 100", {"R_t": "170.10 mΩ", "factory": "174.90 mΩ"},
  "(170.10 − 174.90) ÷ 174.90 × 100 = {=}, looks like a fail", "notes p.3 (figure out why before submitting); a.alpha", "i2", kind="slip")
for nm, cv, fac in (("L1", c1, 174.70), ("L3", c3, 174.60)):
    rr = F(f"l2.{nm}.20", f"{nm} corrected to 20 °C", cv / kk, 2, "mΩ", "R20 = R_t ÷ k", {"R_t": f"{cv:.2f} mΩ", "k": "0.96856"},
           f"{cv:.2f} ÷ 0.96856 = {{=}}", "a.alpha; p.temp", "i2", practice=True)
    F(f"l2.{nm}.dev", f"{nm} deviation from factory", (rr - fac) / fac * 100, 2, "%", "(R20 − factory) ÷ factory × 100",
      {"R20": f"{rr:.2f}", "factory": f"{fac:.2f}"}, f"({rr:.2f} − {fac:.2f}) ÷ {fac:.2f} × 100 = {{=}}", "n.tol", "i2", practice=True)
F("l2.changed", "Changed numbers: L3 from loops 120.40, 121.10, 120.90 mΩ", (120.90 + 121.10 - 120.40) / 2, 2, "mΩ",
  "L3 = (C + B − A) ÷ 2", {"A": "120.40", "B": "121.10", "C": "120.90"}, "(120.90 + 121.10 − 120.40) ÷ 2 = {=}", "n.loopRule", "i2", practice=True)
# Lesson 2: the pictures, the slips and the accepted alternatives
tw = F("l2.twoWire", "Two-wire reading of loop A: both C leads and both C contacts added", A_ + 2 * 30 + 2 * 15, 2, "mΩ",
       "reading = loop + 2 × lead + 2 × contact", {"loop": "339.31 mΩ", "lead": "30 mΩ", "contact": "15 mΩ"},
       "339.31 + 2 × 30 + 2 × 15 = {=}", "p.loopA; p.leadR; p.contactR", "i2", practice=True,
       note="A practice illustration: a two-wire meter adds the total lead resistance to the reading (Keithley, research); the lead and contact values are practice values.")
F("l2.twoWire.pct", "Two-wire reading above the loop", (tw - A_) / A_ * 100, 2, "%", "(reading − loop) ÷ loop × 100",
  {"reading": "429.31 mΩ", "loop": "339.31 mΩ"}, "(429.31 − 339.31) ÷ 339.31 × 100 = {=}", "l2.twoWire", "i2", practice=True)
oc = F("l2.onClamps", "Four wires with the P probes clipped on the C clamps, outside their contacts", A_ + 2 * 15, 2, "mΩ",
       "reading = loop + 2 × contact", {"loop": "339.31 mΩ", "contact": "15 mΩ"}, "339.31 + 2 × 15 = {=}",
       "p.loopA; p.contactR", "i2", practice=True,
       note="The reading is whatever carries the current between the two P points (Seaward, research), so the C contacts join it.")
F("l2.onClamps.pct", "P on the clamps: reading above the loop", (oc - A_) / A_ * 100, 2, "%", "(reading − loop) ÷ loop × 100",
  {"reading": "369.31 mΩ", "loop": "339.31 mΩ"}, "(369.31 − 339.31) ÷ 339.31 × 100 = {=}", "l2.onClamps", "i2", practice=True)
cl = F("l2.cold.L1", "L1 (certificate 174.70 mΩ at 20 °C) as read at 12 °C", 174.70 * kk, 2, "mΩ", "R_t = R20 × k",
       {"R20": "174.70 mΩ", "k": "0.96856"}, "174.70 × 0.96856 = {=}", "a.alpha; p.fac1; p.temp", "i2", practice=True)
F("l2.cold.pct", "L1 at 12 °C against its 20 °C certificate, uncorrected", (cl - 174.70) / 174.70 * 100, 2, "%",
  "(R_t − certificate) ÷ certificate × 100", {"R_t": "169.21 mΩ", "certificate": "174.70 mΩ"},
  "(169.21 − 174.70) ÷ 174.70 × 100 = {=}, outside 2%: a sound core that looks like a fail", "a.alpha; n.tol", "i2", practice=True)
for t in (4, 30):
    kt = F(f"l2.k{t}", f"Temperature factor at {t} °C", 1 + 0.00393 * (t - 20), 5, "", "k = 1 + 0.00393 × (t − 20)", {"t": f"{t} °C"},
           f"1 + 0.00393 × ({t} − 20) = {{=}}", "a.alpha", "i2")
    rt = F(f"l2.read{t}", f"L1 (certificate 174.70 mΩ) as read at {t} °C", 174.70 * kt, 2, "mΩ", "R_t = R20 × k",
           {"R20": "174.70 mΩ", "k": f"{kt:.5f}"}, f"174.70 × {kt:.5f} = {{=}}", "a.alpha; p.fac1", "i2", practice=True)
    F(f"l2.read{t}.pct", f"L1 at {t} °C against its certificate, uncorrected", (rt - 174.70) / 174.70 * 100, 2, "%",
      "(R_t − certificate) ÷ certificate × 100", {"R_t": f"{rt:.2f} mΩ", "certificate": "174.70 mΩ"},
      f"({rt:.2f} − 174.70) ÷ 174.70 × 100 = {{=}}", "a.alpha; n.tol", "i2", practice=True)
F("l2.band", "Degrees from 20 °C that use up the whole 2%", 2 / 0.393, 2, "°C", "Δt = 2% ÷ 0.393% per °C",
  {"tolerance": "2%", "per °C": "0.393%"}, "2 ÷ 0.393 = {=}", "n.tol; a.alpha", "i2")
F("l2.wex.gap1", "Worked example: L3 above L1", (42.375 - 38.785) / 38.785 * 100, 2, "%", "(L3 − L1) ÷ L1 × 100",
  {"L1": "38.785 mΩ", "L3": "42.375 mΩ"}, "(42.375 − 38.785) ÷ 38.785 × 100 = {=}", "notes p.3", "i2")
F("l2.wex.gap2", "Worked example: L3 above L2", (42.375 - 38.115) / 38.115 * 100, 2, "%", "(L3 − L2) ÷ L2 × 100",
  {"L2": "38.115 mΩ", "L3": "42.375 mΩ"}, "(42.375 − 38.115) ÷ 38.115 × 100 = {=}", "notes p.3", "i2")
F("2a.slip", "Slip: the loop sum not halved", B_ + A_ - C_, 2, "mΩ", "B + A − C", {"A": "339.31", "B": "339.21", "C": "338.32"},
  "339.21 + 339.31 − 338.32 = {=}", "n.loopRule (the rule it breaks)", "i2", kind="slip")
F("2a.slip2", "Slip: half of loop A taken as L2", A_ / 2, 2, "mΩ", "A ÷ 2", {"A": "339.31"}, "339.31 ÷ 2 = {=}",
  "n.loopRule (the rule it breaks)", "i2", kind="slip")
F("2b.alt", "Accepted: L2 corrected with the notes' about 0.4% per °C", 170.10 / (1 + 0.004 * (12 - 20)), 2, "mΩ",
  "R20 = R_t ÷ (1 + 0.004 × (t − 20))", {"R_t": "170.10 mΩ", "t": "12 °C"}, "170.10 ÷ (1 + 0.004 × (12 − 20)) = {=}",
  "n.cuTemp; 2a", "i2", practice=True)
F("2b.slip", "Slip: multiplied by the factor instead of dividing", c2 * kk, 2, "mΩ", "R_t × k",
  {"R_t": "170.10 mΩ", "k": "0.96856"}, "170.10 × 0.96856 = {=}", "a.alpha (the rule it breaks)", "i2", kind="slip")
F("2c.alt", "Accepted: deviation from the 0.4% per °C figure", (175.72 - 174.90) / 174.90 * 100, 2, "%",
  "(R20 − factory) ÷ factory × 100", {"R20": "175.72 mΩ", "factory": "174.90 mΩ"}, "(175.72 − 174.90) ÷ 174.90 × 100 = {=}",
  "2b.alt; p.fac2", "i2", practice=True)
F("2c.slip2", "Slip: the difference taken the wrong way round", (174.90 - 175.62) / 174.90 * 100, 2, "%",
  "(factory − R20) ÷ factory × 100", {"R20": "175.62 mΩ", "factory": "174.90 mΩ"}, "(174.90 − 175.62) ÷ 174.90 × 100 = {=}",
  "n.tol (the rule it breaks)", "i2", kind="slip")
F("l2.changed.slip", "Changed numbers slip: not halved", 120.90 + 121.10 - 120.40, 2, "mΩ", "C + B − A",
  {"A": "120.40", "B": "121.10", "C": "120.90"}, "120.90 + 121.10 − 120.40 = {=}", "n.loopRule (the rule it breaks)", "i2", kind="slip")
F("l2.changed.slip2", "Changed numbers slip: L1's formula", (120.40 + 120.90 - 121.10) / 2, 2, "mΩ", "(A + C − B) ÷ 2",
  {"A": "120.40", "B": "121.10", "C": "120.90"}, "(120.40 + 120.90 − 121.10) ÷ 2 = {=}", "n.loopRule (the rule it breaks)", "i2", kind="slip")
F("l2.changed.check", "Changed numbers check: (A + B + C) ÷ 2", (120.40 + 121.10 + 120.90) / 2, 2, "mΩ", "(A + B + C) ÷ 2",
  {"A": "120.40", "B": "121.10", "C": "120.90"}, "(120.40 + 121.10 + 120.90) ÷ 2 = {=}", "n.loopRule", "i2", practice=True,
  note="L1 60.10 + L2 60.30 + L3 60.80 = 181.20 mΩ.")

# Lesson 3
F("l3.recall", "Recall: PI with 2.0 GΩ at 1 min and 6.0 GΩ at 10 min", 6.0 / 2.0, 2, "", "PI = R10 ÷ R1",
  {"R1": "2.0 GΩ", "R10": "6.0 GΩ"}, "6.0 ÷ 2.0 = {=}, 'okay' (2-4)", "notes p.4", "i3")
F("l3.recall.slip1", "Recall slip: the ratio upside down", 2.0 / 6.0, 2, "", "R1 ÷ R10", {"R1": "2.0", "R10": "6.0"},
  "2.0 ÷ 6.0 = {=}", "notes p.4 (the rule it breaks)", "i3", kind="slip")
irs = {"1": (18.0, 24.0, 62.0), "2": (2.10, 2.20, 2.40), "3": (17.5, 23.0, 60.0)}
for core, (r30, r1, r10) in irs.items():
    pid = {"1": "3a", "2": "3b"}.get(core)
    F(pid or f"l3.L{core}.PI", f"L{core} polarisation index", r10 / r1, 2, "", "PI = R10 ÷ R1",
      {"R10": f"{r10:.2f} GΩ", "R1": f"{r1:.2f} GΩ"}, f"{r10:.2f} ÷ {r1:.2f} = {{=}}", f"n.pi; p.ir{core}", "i3",
      kind="case" if pid else "worked", part=pid, practice=True)
    F(f"l3.L{core}.DAR", f"L{core} dielectric absorption ratio", r1 / r30, 2, "", "DAR = R60s ÷ R30s",
      {"R60s": f"{r1:.2f} GΩ", "R30s": f"{r30:.2f} GΩ"}, f"{r1:.2f} ÷ {r30:.2f} = {{=}}", f"n.dar; p.ir{core}", "i3", practice=True)
F("3c", "Least discharge time after the 10-minute PI test", 5 * 10, 0, "min", "5 × the time the voltage was applied",
  {"time": "10 min"}, "5 × 10 = {=}", "n.discharge; t.discharge; a.chargeTime (Megger, research source 223)", "i3", kind="case", part="3c", practice=True)
F("l3.energy", "Energy stored in one core at 5 kV", 0.5 * C * 1e-6 * 5000 ** 2, 2, "J", "E = ½ × C × V²",
  {"C": "0.528 µF", "V": "5 kV"}, "0.5 × 0.528 × 10⁻⁶ × 5000² = {=}", "1a; p.irV", "i3", practice=True)
F("l3.charge", "Charge in one core at 5 kV", C * 1e-6 * 5000 * 1000, 2, "mC", "Q = C × V",
  {"C": "0.528 µF", "V": "5 kV"}, "0.528 × 10⁻⁶ × 5000 = 0.00264 C = {=}", "1a; p.irV", "i3", practice=True)
F("l3.changed", "Changed numbers: PI with 8.0 GΩ at 1 min, 9.6 GΩ at 10 min", 9.6 / 8.0, 2, "", "PI = R10 ÷ R1",
  {"R1": "8.0", "R10": "9.6"}, "9.6 ÷ 8.0 = {=}, questionable", "n.pi", "i3", practice=True)
# Lesson 3: the slips its choices and typed answers name, and the check's two cores
F("l3.recall.slip2", "Recall slip: the rise taken for the index", 6.0 - 2.0, 1, "GΩ", "R10 − R1",
  {"R10": "6.0 GΩ", "R1": "2.0 GΩ"}, "6.0 − 2.0 = {=}", "notes p.4 (the rule it breaks)", "i3", kind="slip")
F("3a.slip", "Slip: L1's ratio upside down", 24.0 / 62.0, 2, "", "R1 ÷ R10",
  {"R1": "24.00", "R10": "62.00"}, "24.00 ÷ 62.00 = {=}", "n.pi (the rule it breaks)", "i3", kind="slip")
F("3a.slip2", "Slip: L1's rise taken for the index", 62.0 - 24.0, 1, "GΩ", "R10 − R1",
  {"R10": "62.0", "R1": "24.0"}, "62.0 − 24.0 = {=}", "n.pi (the rule it breaks)", "i3", kind="slip")
F("3b.slip", "Slip: L2's ratio upside down", 2.20 / 2.40, 2, "", "R1 ÷ R10",
  {"R1": "2.20", "R10": "2.40"}, "2.20 ÷ 2.40 = {=}", "n.pi (the rule it breaks)", "i3", kind="slip")
F("3b.slip2", "Slip: L2's rise taken for the index", 2.40 - 2.20, 2, "GΩ", "R10 − R1",
  {"R10": "2.40", "R1": "2.20"}, "2.40 − 2.20 = {=}", "n.pi (the rule it breaks)", "i3", kind="slip")
F("3c.slip", "Slip: the test time taken for the discharge time", 1 * 10, 0, "min", "1 × the time the voltage was applied",
  {"time": "10 min"}, "1 × 10 = {=}", "n.discharge (the rule it breaks)", "i3", kind="slip")
F("3c.slip2", "Slip: four times, an older rule, where the lesson uses five", 4 * 10, 0, "min", "4 × the time the voltage was applied",
  {"time": "10 min"}, "4 × 10 = {=}", "t.discharge (Megger's older guide says about four times; the lesson uses five)", "i3", kind="slip")
F("l3.changed.slip", "Changed numbers slip: the ratio upside down", 8.0 / 9.6, 2, "", "R1 ÷ R10",
  {"R1": "8.0", "R10": "9.6"}, "8.0 ÷ 9.6 = {=}", "n.pi (the rule it breaks)", "i3", kind="slip")
F("l3.changed.slip2", "Changed numbers slip: the rise taken for the index", 9.6 - 8.0, 1, "GΩ", "R10 − R1",
  {"R10": "9.6", "R1": "8.0"}, "9.6 − 8.0 = {=}", "n.pi (the rule it breaks)", "i3", kind="slip")
F("l3.check.X", "Check: core X's PI, 3.00 GΩ at 1 min and 3.20 GΩ at 10 min", 3.20 / 3.00, 2, "", "PI = R10 ÷ R1",
  {"R10": "3.20 GΩ", "R1": "3.00 GΩ"}, "3.20 ÷ 3.00 = {=}, questionable", "n.pi", "i3", practice=True)
F("l3.check.Y", "Check: core Y's PI, 3.00 GΩ at 1 min and 9.00 GΩ at 10 min", 9.00 / 3.00, 2, "", "PI = R10 ÷ R1",
  {"R10": "9.00 GΩ", "R1": "3.00 GΩ"}, "9.00 ÷ 3.00 = {=}, okay", "n.pi", "i3", practice=True)

# Lesson 4
F("l4.recall", "Recall: sheath test voltage for a 2.0 mm sheath", 4 * 2.0, 1, "kV", "V = 4 kV/mm × t, at most 10 kV",
  {"t": "2.0 mm"}, "4 × 2.0 = {=}, under the 10 kV cap", "notes p.4", "i4")
F("4a", "Sheath test voltage for the case cable's 2.2 mm sheath", min(4 * 2.2, 10), 1, "kV", "V = 4 kV/mm × t, at most 10 kV",
  {"t": "2.2 mm"}, "4 × 2.2 = {=}, under the 10 kV cap, held 1 minute", "n.sheath; t.sheathIEC; p.sheathT", "i4",
  kind="case", part="4a", practice=True)
F("l4.stressL2", "Stress across L2's sheath when it tripped", 3.2 / 2.2, 2, "kV/mm", "stress = V ÷ t",
  {"V": "3.2 kV", "t": "2.2 mm"}, "3.2 ÷ 2.2 = {=}", "p.sheathL2; p.sheathT", "i4", practice=True)
F("l4.changed", "Changed numbers: a 3.0 mm sheath", min(4 * 3.0, 10), 1, "kV", "V = 4 kV/mm × t, at most 10 kV",
  {"t": "3.0 mm"}, "4 × 3.0 = 12.0 kV, over the cap, so {=}", "n.sheath", "i4", practice=True)
F("l4.changed.slip", "Slip: the 10 kV cap ignored", 4 * 3.0, 1, "kV", "4 × t", {"t": "3.0 mm"}, "4 × 3.0 = {=}",
  "n.sheath (the rule it breaks)", "i4", kind="slip")
F("l4.changed.stress", "Stress across the 3.0 mm sheath at the cap", 10 / 3.0, 2, "kV/mm", "stress = V ÷ t",
  {"V": "10 kV", "t": "3.0 mm"}, "10 ÷ 3.0 = {=}", "n.sheath", "i4", practice=True)

# Lesson 5
F("l5.recall.lo", "Recall: lowest VLF test voltage, 12/20 kV cable", 1.5 * 12, 1, "kV", "1.5 × U0", {"U0": "12 kV"},
  "1.5 × 12 = {=}", "notes p.7", "i5")
F("l5.recall.hi", "Recall: highest VLF test voltage, 12/20 kV cable", 2.5 * 12, 1, "kV", "2.5 × U0", {"U0": "12 kV"},
  "2.5 × 12 = {=}", "notes p.7", "i5")
F("l5.recall.slip1", "Recall slip: 20 kV taken as U0 (low end)", 1.5 * 20, 1, "kV", "1.5 × U", {"U": "20 kV"},
  "1.5 × 20 = {=}", "notes p.7 (the rule it breaks)", "i5", kind="slip")
Vt = F("5a", "VLF test voltage, case cable", 2 * 38, 1, "kV", "V = 2 × U0", {"U0": "38 kV"}, "2 × 38 = {=} rms",
       "p.vlfSpec; p.U0", "i5", kind="case", part="5a", practice=True)
F("l5.range.lo", "1.5 U0 for the case cable", 1.5 * 38, 1, "kV", "1.5 × U0", {"U0": "38 kV"}, "1.5 × 38 = {=}", "n.vlfU", "i5", practice=True)
F("l5.range.hi", "2.5 U0 for the case cable", 2.5 * 38, 1, "kV", "2.5 × U0", {"U0": "38 kV"}, "2.5 × 38 = {=}", "n.vlfU", "i5", practice=True)
I01 = F("5b", "Charging current of one core at 0.1 Hz and 76 kV", 2 * math.pi * 0.1 * C * 1e-6 * Vt * 1000 * 1000, 2, "mA",
        "I = 2πfC × V", {"f": "0.1 Hz", "C": "0.528 µF", "V": "76 kV"}, "2π × 0.1 × 0.528 × 10⁻⁶ × 76 000 = 0.02521 A = {=}",
        "1a; 5a", "i5", kind="case", part="5b", practice=True)
I50 = F("5c", "Charging current of one core at 50 Hz and 76 kV", w50 * C * 1e-6 * Vt * 1000, 2, "A",
        "I = 2πfC × V", {"f": "50 Hz", "C": "0.528 µF", "V": "76 kV"}, "2π × 50 × 0.528 × 10⁻⁶ × 76 000 = {=}",
        "1a; 5a", "i5", kind="case", part="5c", practice=True)
F("l5.ratio", "How many times smaller at 0.1 Hz", 50 / 0.1, 0, "", "50 ÷ 0.1", {}, "50 ÷ 0.1 = {=}", "notes p.6 (added background, checked by arithmetic)", "i5")
F("l5.kva50", "Reactive power the test set must supply at 50 Hz", 76 * (w50 * C * 1e-6 * 76000), 1, "kVA", "S = V × I",
  {"V": "76 kV", "I": "12.61 A"}, "76 × 12.606 = {=}", "5c", "i5", practice=True)
F("l5.kva01", "Reactive power at 0.1 Hz", 76 * (2 * math.pi * 0.1 * C * 1e-6 * 76000), 2, "kVA", "S = V × I",
  {"V": "76 kV", "I": "25.21 mA"}, "76 × 0.025213 = {=}", "5b", "i5", practice=True)
F("l5.changed", "Changed numbers: a 3.10 km core at 0.1 Hz and 76 kV", 2 * math.pi * 0.1 * 0.22 * 3.10 * 1e-6 * 76000 * 1000, 2, "mA",
  "I = 2πfC × V", {"f": "0.1 Hz", "C": "0.22 × 3.10 = 0.682 µF", "V": "76 kV"}, "2π × 0.1 × 0.682 × 10⁻⁶ × 76 000 = {=}",
  "t.C66", "i5", practice=True)

# Lesson 6
F("l6.recall", "Recall: distance for 20.0 µs at 160 m/µs", 20.0 * 160 / 2, 0, "m", "L = t × v ÷ 2",
  {"t": "20.0 µs", "v": "160 m/µs"}, "20.0 × 160 ÷ 2 = {=}", "notes p.7", "i6")
F("l6.recall.slip1", "Recall slip: the ÷ 2 left out", 20.0 * 160, 0, "m", "t × v", {"t": "20.0", "v": "160"},
  "20.0 × 160 = {=}", "notes p.7 (the rule it breaks)", "i6", kind="slip")
F("l6.wex", "Worked example: 5% of a 2 km cable", 0.05 * 2000, 0, "m", "error = VF error × length", {"VF error": "5%", "length": "2000 m"},
  "0.05 × 2000 = {=}", "notes p.7", "i6")
v = F("6a", "Velocity from the open-end reflection", 2 * 2400 / 28.57, 1, "m/µs", "v = 2L ÷ t",
      {"L": "2400 m", "t": "28.57 µs"}, "2 × 2400 ÷ 28.57 = {=}", "a.vCal; p.len; p.tEnd", "i6", kind="case", part="6a", practice=True,
      note="VF = 168.0 ÷ 299.8 = 0.56, inside Megger's 0.54-0.62 for XLPE (t.vfXLPE).")
F("l6.VF", "Velocity factor", v / 299.792458, 2, "", "VF = v ÷ c", {"v": "168.0 m/µs", "c": "299.8 m/µs"}, "168.0 ÷ 299.8 = {=}",
  "6a; t.vfXLPE", "i6", practice=True)
d = F("6b", "Distance to L2's fault from the OSS", 11.43 * v / 2, 1, "m", "L = t × v ÷ 2",
      {"t": "11.43 µs", "v": "168.0 m/µs"}, "11.43 × 168.0 ÷ 2 = {=}", "n.tdrRule; p.tFault; 6a", "i6", kind="case", part="6b", practice=True,
      accept={"min": 960.0, "max": 960.2, "why": "v unrounded (168.008 m/µs) gives 960.17 m"})
F("6b.slip", "Slip: a default 160 m/µs left set", 11.43 * 160 / 2, 1, "m", "L = t × v ÷ 2", {"t": "11.43", "v": "160"},
  "11.43 × 160 ÷ 2 = {=}", "notes p.7 (set the velocity first)", "i6", kind="slip")
F("6b.slip2", "Slip: the ÷ 2 left out", 11.43 * v, 1, "m", "t × v", {"t": "11.43", "v": "168.0"}, "11.43 × 168.0 = {=}",
  "notes p.7 (the rule it breaks)", "i6", kind="slip")
F("6c", "Distance to the fault from B01", 2400 - d, 1, "m", "B01 distance = length − OSS distance",
  {"length": "2400 m", "OSS distance": "960.1 m"}, "2400 − 960.1 = {=}", "p.len; 6b", "i6", kind="case", part="6c", practice=True)
F("l6.joint.t", "Where the field joint should show, from the OSS", 2 * 1620 / v, 2, "µs", "t = 2L ÷ v",
  {"L": "1620 m", "v": "168.0 m/µs"}, "2 × 1620 ÷ 168.0 = {=}", "p.joint; 6a", "i6", practice=True)
F("l6.changed", "Changed numbers: 15.00 µs at 172 m/µs", 15.00 * 172 / 2, 1, "m", "L = t × v ÷ 2",
  {"t": "15.00 µs", "v": "172 m/µs"}, "15.00 × 172 ÷ 2 = {=}", "n.tdrRule", "i6", practice=True)

# Lesson 7
F("7a", "Spacing of the resonances in L2's impedance spectrum", v * 1e6 / (2 * 2400) / 1000, 1, "kHz", "Δf = v ÷ 2L",
  {"v": "168.0 m/µs", "L": "2400 m"}, "168.0 × 10⁶ ÷ (2 × 2400) = 35 000 Hz = {=}", "6a; p.len; research: transmission-line resonance (LIRA papers)",
  "i7", kind="case", part="7a", practice=True)
F("7b", "The B01 reading measured from the OSS end", 2400 - 1441, 0, "m", "from OSS = length − from B01",
  {"length": "2400 m", "from B01": "1441 m"}, "2400 − 1441 = {=}; the OSS reading is 961 m and TDR said 960.1 m", "p.liraOSS; p.liraB01",
  "i7", kind="case", part="7b", practice=True)
F("l7.changed", "Changed numbers: length from 25.0 kHz spacing at 168 m/µs", 168e6 / (2 * 25000), 0, "m", "L = v ÷ 2Δf",
  {"v": "168 m/µs", "Δf": "25.0 kHz"}, "168 × 10⁶ ÷ (2 × 25 000) = {=}", "7a (rule rearranged)", "i7", practice=True)

# sanity checks against the notes' printed figures
assert rnd((wa + wc - wb) / 2, 3) == 38.785 and rnd((wb + wa - wc) / 2, 3) == 38.115 and rnd((wc + wb - wa) / 2, 3) == 42.375
assert rnd(0.05 * 2000, 0) == 100 and rnd(50 / 0.1, 0) == 500

toResearch = [
    {"id": "r.C", "needs": ["capacitance per core and charging current for a 66 kV three-core XLPE submarine cable, quoted from a maker (t.C66, t.Ich66)"], "for": ["1a", "1b", "l1.Ich", "l3.energy", "5b", "5c"]},
    {"id": "r.alpha", "needs": ["copper's temperature correction (IEC 60228 Annex B or a maker), to replace the notes' 'about 0.4% per °C' (quoted in the i2 research: sources 210-212)"], "for": ["l2.k", "2b", "2c"]},
    {"id": "r.discharge", "needs": ["the test-set maker's discharge rule after an IR test, and what 'charging time' means"], "for": ["3c"]},
    {"id": "r.pi", "needs": ["Megger 'A Stitch in Time' Table I (PI and DAR bands), and whether PI is meaningful on long XLPE cables with very high IR (contested)"], "for": ["3a", "3b"]},
    {"id": "r.sheath", "needs": ["IEC 60229:2007 clause 5 word for word (t.sheathIEC)"], "for": ["4a"]},
    {"id": "r.vlfU", "needs": ["IEEE 400.2-2024 Table 3 (or the 2013 table) for the 69 kV row and the U0 multiples; the notes' 1.5-2.5 U0 against the guide's '2 U0 to 3 U0' for installation and acceptance (contested)"], "for": ["5a", "l5.range.lo", "l5.range.hi"]},
    {"id": "r.vf", "needs": ["Megger TDR_AN58 typical VF for power XLPE (t.vfXLPE)"], "for": ["6a", "l6.VF"]},
    {"id": "r.lira", "needs": ["a LIRA paper on the input-impedance resonances of an unterminated line and the spot signature (Fantoni; Wirescan white paper WP01)"], "for": ["7a"]},
]

lessons = [
    {"n": 1, "title": "The cable, and making it safe to test", "sectionA": ["1a", "1b"]},
    {"n": 2, "title": "Phases and conductors: the four-wire measurement", "sectionA": ["2a", "2b", "2c"]},
    {"n": 3, "title": "Insulation resistance over ten minutes: IR, DAR and PI", "sectionA": ["3a", "3b", "3c"]},
    {"n": 4, "title": "The sheath test: 4 kV per millimetre", "sectionA": ["4a"]},
    {"n": 5, "title": "VLF withstand: why 0.1 Hz", "sectionA": ["5a", "5b", "5c"]},
    {"n": 6, "title": "TDR: reading the reflections", "sectionA": ["6a", "6b", "6c"]},
    {"n": 7, "title": "LIRA: the cable's impedance spectrum", "sectionA": ["7a", "7b"]},
]

# ---------------------------------------------------------------- lesson 3 research (20 Oct), kept here so a rebuild keeps it
_L3 = json.loads(r'''{"givens": [{"id": "p.irTau", "label": "Absorption time constant of the IR curve (interactive model)", "value": 70, "unit": "s", "text": "70 s", "practice": true, "cite": "practice value (the running case is made up for practice; no real wind farm); drives the curve in the lesson 3 picture only: 1/R(t) = 1/R∞ + A × e^(−t/τ), where 1/R∞ is the steady leakage and A the absorption. Fitted through the 30 s and 1 min readings, it lands within 7 per cent of the 10 min readings: L1 R∞ 63.7 GΩ (model gives 63.6 GΩ at 10 min against the 62 GΩ read); L2 R∞ 2.4 GΩ (model gives 2.4 GΩ at 10 min against the 2.4 GΩ read); L3 R∞ 55.7 GΩ (model gives 55.7 GΩ at 10 min against the 60 GΩ read). The picture marks the case readings themselves. Moisture adds to the steady leakage and nothing else. No standard gives a τ; the real one differs with every cable."}, {"id": "p.irTauC", "label": "Charging current time constant of the IR curve (interactive model)", "value": 3, "unit": "s", "text": "3 s", "practice": true, "cite": "practice value (the running case is made up for practice; no real wind farm); the charging current dies in seconds (Megger: it \"falls to negligible values\"; research source 236). Drawn before the first reading at 30 s, so no figure depends on it."}, {"id": "t.IRtemp", "label": "Rule of thumb: insulation resistance halves for every 10 °C rise", "value": "halve per +10 °C; double per −10 °C", "text": "halve per +10 °C; double per −10 °C", "cite": "Megger, \"Can we beat the heat?\" (research source 234) and \"A Stitch in Time\" (source 235); a rule of thumb, each insulation differs"}, {"id": "t.polarity", "label": "Test lead polarity on a cable", "value": "positive (red) to the screen; negative (black) to the core", "text": "positive (red) to the screen; negative (black) to the core", "cite": "notes p.4; Megger above-1 kV guide: positive terminal to the grounded outside of a cable (research source 226). Megger adds that polarity rarely matters for a plain IR test, but on older wet insulation the reading is lower with the positive terminal on the grounded side (source 227)."}, {"id": "t.discharge", "label": "Discharge time after an IR test", "value": "5 × the time the voltage was applied (50 min after a 10 min PI test)", "text": "5 × the time the voltage was applied; 50 min after a 10 min PI test", "cite": "Megger, A guide to diagnostic insulation testing above 1 kV (research source 223); Fluke application note: about five times the testing charge time (source 222). Megger's older guide says about four times (research source 107)."}], "assumptions": [{"id": "a.piHigh", "label": "The lesson teaches PI as the notes do, though String B's 1-minute readings are far above 5000 MΩ", "status": "contested", "why": "IEEE 43 (a rotating-machine practice, quoted through AEMC, research source 233) does not recommend PI as an assessment tool when the 1-minute reading is above 5000 MΩ. L1 reads 24 GΩ and L3 23 GΩ at 1 minute. The notes and Megger apply PI to cables with no such limit, and Fluke says cabling shows little absorption current (source 238). The lesson works PI on the case readings as the notes teach it, says the high reading makes the ratio less trustworthy, and tells him the client's criterion and the trend settle the matter. The readings are not changed.", "text": "Contested: the lesson teaches PI as the notes do, though String B's 1-minute readings are far above 5000 MΩ. IEEE 43 (a rotating-machine practice, research source 233) does not recommend PI above 5000 MΩ at 1 minute; the notes and Megger set no such limit for cables. The lesson says so, and the client's criterion and the trend settle it."}, {"id": "a.bands", "label": "PI and DAR bands: the notes' names are used", "status": "contested", "why": "Megger's Table I names PI below 1 dangerous, 1 to 2 questionable, 2 to 4 good, above 4 excellent, and DAR 1.0 to 1.25 questionable, 1.4 to 1.6 good, above 1.6 excellent with a gap between 1.25 and 1.4 (research sources 239, 240); a Megger Q&A calls PI 2.0 or higher and DAR 1.4 or higher good (sources 96, 97). The notes use poor, questionable, okay, good and DAR 1.25 and 1.6 with no gap (sources 26, 27). Practice readings are placed on the notes' bands; the others are shown as a maker's view.", "text": "Contested: the lesson places String B on the notes' PI and DAR bands and shows Megger's Table I as a maker's different view (research sources 239, 240, 96, 97). The client's criterion settles pass or fail."}], "replace_assumptions": [{"id": "a.chargeTime", "label": "The 'charging time' in the 5× discharge rule is the time the test voltage was applied", "why": "The notes do not define it. Megger's guide to testing above 1 kV says to discharge the item for five times as long as it was tested and gives the example: after a 10-minute PI test, allow the unit to discharge for 50 minutes (research source 223). A Fluke application note says the discharge time should be about five times the testing charge time (source 222). The same Megger guide also uses 'charging time' for the time a test set takes to charge the sample, a separate figure that depends on capacitance (source 224). Megger's older guide gives about four times (source 107): the lesson uses five.", "status": "sourced", "text": "Sourced: the charging time in the 5× rule is the time the test voltage was applied. The notes do not define it. Megger's guide to testing above 1 kV says to discharge the item for five times as long as it was tested and gives the example: after a 10-minute PI test, allow the unit to discharge for 50 minutes (research source 223). A Fluke application note says the discharge time should be about five times the testing charge time (source 222). The same Megger guide also uses 'charging time' for the time a test set takes to charge the sample, a separate figure that depends on capacitance (source 224). Megger's older guide gives about four times (source 107): the lesson uses five."}], "replace_toResearch": [{"id": "r.discharge", "needs": ["the test-set maker's discharge rule after an IR test, and what 'charging time' means"], "for": ["3c"], "resolved": true, "found": "Megger, A guide to diagnostic insulation testing above 1 kV: discharge for five times as long as the item was tested; 50 minutes after a 10-minute PI test (source 223). Fluke application note (source 222). Older Megger guide says four times (source 107). The 'charging time' reading is settled in a.chargeTime."}, {"id": "r.pi", "needs": ["Megger 'A Stitch in Time' Table I (PI and DAR bands), and whether PI is meaningful on long XLPE cables with very high IR (contested)"], "for": ["3a", "3b"], "resolved": true, "found": "Megger Table I (sources 239, 240) and Q&A (96, 97) against the notes' bands: contested (a.bands). PI on a very high reading: IEEE 43 says not recommended above 5000 MΩ at 1 minute (source 233): contested (a.piHigh)."}]}''')
givens.extend(_L3["givens"]); assumptions.extend(_L3["assumptions"])
for _k, _lst in (("assumptions", assumptions), ("toResearch", toResearch)):
    for _x in _L3["replace_" + _k]:
        _lst[[_y["id"] for _y in _lst].index(_x["id"])] = _x

case = {
    "v": 1,
    "title": "String B: the cable from B01 to the substation",
    "course": "subsea-cable-testing",
    "courseTitle": TITLE,
    "updated": "2026-10-20",
    "about": "The running case for " + TITLE + ", a refresher in the format Dan approved for Design and verification (format/refresher.md there). A made-up commissioning job: every given is cited to Dan's notes (notes p.N, the PDF page), marked as a practice value, or marked as a typical value research must quote. Every figure is worked by a script from the inputs shown with it. Items marked ➕ in his notes are background to check, not sources.",
    "rounding": "Each figure is worked from the inputs shown with it, rounded half up: currents, energies and resistances in mΩ to 2 decimal places (3 where the notes print 3), voltages in kV and distances in m to 1, ratios to 2. A typed answer is accepted within \"accept\" where given.",
    "cites": {"notes": "source/subsea-cable-testing-notes.pdf, PDF page (Dan's own notes, 10 pages)",
              "practice value": "made up for the running case; said so on screen",
              "to research": "a typical value the research stage must quote word for word before a lesson uses it"},
    "scenario": {
        "title": "String B: the cable from B01 to the substation",
        "text": "Commissioning tests on a newly laid 66 kV inter-array cable on an offshore wind farm. It runs 2.40 km from turbine B01 to the offshore substation (OSS), the last cable of string B. Three-core, 3 × 240 mm² copper, XLPE, 38/66 (72.5) kV, copper wire screens, armoured, with one field joint 1620 m from the OSS. A technician at each end, talking before every change. The live string A runs in the same corridor. One fault waits to be found. Every figure is a practice value unless it is cited.",
        "source": "A practice job, made up for this course; the test methods and limits are from Dan's notes."},
    "givens": givens, "assumptions": assumptions, "lessons": lessons, "figures": figures,
    "pending": [], "toResearch": toResearch,
}
json.dump(case, open(OUT, "w"), ensure_ascii=False, indent=1)
open(OUT, "a").write("\n")
print(len(givens), "givens;", len(assumptions), "assumptions;", len(figures), "figures")
for f in figures:
    if f.get("part"): print(f["part"], f["text"], "|", f["work"])
