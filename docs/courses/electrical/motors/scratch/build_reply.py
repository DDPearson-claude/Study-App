#!/usr/bin/env python3
# Builds research.reply.txt from a table of (key, title, url, quote). Quotes are checked afterwards by
# tools/eval/sources.mjs against the saved tool files; nothing here is a source of facts.
import json, sys

S = {}   # key -> (title, url, quote)
def s(key, title, url, quote):
    assert key not in S, key
    S[key] = (title, url, quote)

# ---------- his own materials ----------
IND = 'Your motor sheet: the three-phase induction motor'
s('ind_cut', IND, 'material:induction#p1', "The rotating magnetic field cuts across the conductors of the motor's rotating inner part, the rotor.")
s('ind_field', IND, 'material:induction#p1', "These windings are physically arranged 120 electrical degrees apart. When energized, the three phase-shifted currents produce a combined magnetic field that rotates at a constant speed, called the synchronous speed.")
s('ind_torque', IND, 'material:induction#p1', "This rotor magnetic field interacts with the stator's rotating magnetic field, producing a rotational force, or torque, that causes the rotor and its shaft to spin.")
s('ind_noslip', IND, 'material:induction#p1', "If the rotor and the magnetic field moved at the same speed, no current would be induced, and no torque would be produced.")
s('ind_cage', IND, 'material:induction#p2', "Simple, rugged, and low-maintenance because it has no brushes or slip rings.")
s('ind_wound', IND, 'material:induction#p2', "Allows for a higher starting torque and a greater degree of speed control by adjusting the external resistance.")
s('ind_uses', IND, 'material:induction#p2', "Ideal for constant-speed applications such as fans, pumps, conveyors, and compressors.")
s('ind_pf', IND, 'material:induction#p3', "The motor draws a large magnetizing current, which causes it to operate at a poor power factor, particularly under light loads.")
s('ind_speedctl', IND, 'material:induction#p3', "As constant-speed machines, speed control can be difficult without additional equipment like a Variable Frequency Drive (VFD).")
s('ind_inrush', IND, 'material:induction#p3', "The initial inrush current during startup can be very high, which can cause voltage dips in the power line.")
s('ind_expl', IND, 'material:induction#p3', "The absence of sparking brushes makes them safe for hazardous environments.")

DOL = 'Your DOL study sheet: the direct online starter'
s('sh_makes', DOL, 'material:dol-sheet#p1', "The start button 'makes' the circuit, the stop button 'breaks' the circuit.")
s('sh_start', DOL, 'material:dol-sheet#p1', "The coil magnetises the main contacts and pulls them closed and holds them in place, enabling the motor to connect to the supply and become energised.")
s('sh_isol', DOL, 'material:dol-sheet#p1', "The isolator (2) when closed allows current to flow into the contactor.")
s('sh_coil', DOL, 'material:dol-sheet#p1', "230V contactor coil (only connected to one phase and neutral meaning only 230V is present.")
s('sh_latch', DOL, 'material:dol-sheet#p1', "Latching (maintaining) contacts. These 'pull' and 'hold' the main contacts in place, these are pulled into place by the magnetic field created by the energising of (4).")
s('sh_drop', DOL, 'material:dol-sheet#p1', "the magnetic effect disappears and the latching contacts release.")
s('sh_ol', DOL, 'material:dol-sheet#p1', "The bend in the strips causes the overload release contact to break the circuit, which de-energises the coil, releasing the contacts and isolating the motor from the supply.")
s('sh_9_10', DOL, 'material:dol-sheet#p1', "9 and 10 work together to disconnect the circuit in the same way as the stop button.")
s('sh_sprung', DOL, 'material:dol-sheet#p1', "Normally open (N/O) start button. This is 'sprung' meaning it'll return to N/O once released.")
s('sh_5kw', DOL, 'material:dol-sheet#p1', "Generally used for the starting and stopping of small machinery up to 5kW.")
s('sh_uses', DOL, 'material:dol-sheet#p1', "Compressors, pumps and fans are typically controlled by DOL starters.")
s('sh_inrush', DOL, 'material:dol-sheet#p1', "Due to the nature of the starter, a high in-rush of current can be tolerated, unlike a traditional switch.")
s('sh_thermal', DOL, 'material:dol-sheet#p1', "DOL starters have thermal overloads, which can mean 'overuse' or regular stopping and starting can cause these to operate.")

HB = 'Your group handout: DOL start and stop buttons'
s('hb_par', HB, 'material:handout-dol-buttons#p1', "START BUTTONS ARE WIRED IN PARALLEL.")
s('hb_coil', HB, 'material:handout-dol-buttons#p1', "IMPORTANT TO GET THE COIL VOLTAGE RATING RIGHT")
s('hsd_x3', 'Your group handout: the star-delta starter question', 'material:handout-star-delta#p2', "6186.88×3 = 18560.64 W.")

DW = 'Your motor sheet: the DOL starter (web summary)'
s('dw_close', DW, 'material:dol-starter#p1', "The energized coil pulls the contactor's main contacts closed, applying the full line voltage to the motor.")
s('dw_inrush', DW, 'material:dol-starter#p2', "High inrush current: The motor draws 6 to 8 times its normal full-load current during startup.")
s('dw_fuse', DW, 'material:dol-starter#p2', "Circuit Breaker or Fuse: Provides short-circuit and overcurrent protection for the system.")
s('dw_100', DW, 'material:dol-starter#p2', "Applying full voltage at startup provides 100% of the motor's rated torque, which is necessary for some applications.")
s('dw_4kw', DW, 'material:dol-starter#p3', "DOL starters are typically limited to smaller motors (often under 4 kW) where the power supply can tolerate the voltage dip.")

VS = 'Your motor sheet: the variable speed drive'
s('vs_rect', VS, 'material:vsd#p1', "Converts the incoming alternating current (AC) power from the main supply into direct current (DC) power.")
s('vs_bus', VS, 'material:vsd#p1', "Uses capacitors and other components to smooth out the rectified DC power")
s('vs_pwm', VS, 'material:vsd#p1', "Uses a technique called Pulse Width Modulation (PWM), rapidly switching transistors (typically Insulated Gate Bipolar Transistors or IGBTs) on and off to create a simulated AC output.")
s('vs_soft', VS, 'material:vsd#p2', "eliminate the initial inrush of high current and mechanical shock that occur when a motor is started abruptly.")
s('vs_marine', VS, 'material:vsd#p2', "Marine: Controlling propulsion systems and other motor-driven equipment on vessels for improved energy efficiency.")

SP = 'Your motor sheet: the split-phase motor'
s('sp_wire', SP, 'material:split-phase#p1', "The starting winding is made of thin wire with fewer turns, giving it a higher resistance and lower inductance.")
s('sp_lead', SP, 'material:split-phase#p1', "This difference in electrical properties causes the current in the starting winding to lead the current in the main winding.")
s('sp_switch', SP, 'material:split-phase#p1', "Once the motor reaches about 75% of its running speed, a centrifugal switch opens to disconnect the starting winding, and the main winding sustains the motor's operation.")
s('sp_uses', SP, 'material:split-phase#p2', "Because of their low starting torque, they are best suited for applications with little to no initial load, such as fans, and some types of pumps and compressors.")

CS = 'Your motor sheet: the capacitor-start motor'
s('cs_phase', CS, 'material:capacitor-start#p1', "This capacitor causes the current in the auxiliary winding to be out of phase with the current in the main winding, creating the necessary rotating magnetic field.")
s('cs_switch', CS, 'material:capacitor-start#p1', "Once the motor reaches about 75–80% of its rated speed, a centrifugal switch on the motor shaft automatically disconnects the auxiliary winding and the start capacitor from the circuit.")
s('cs_mom', CS, 'material:capacitor-start#p1', "The motor then continues to run on the main winding alone, with the momentum from the startup keeping it going.")
s('cs_heavy', CS, 'material:capacitor-start#p1', "This gives the motor the high starting torque required for heavy loads.")

SE = 'Your motor sheet: the DC series motor'
s('se_series', SE, 'material:dc-series#p1', "A DC series motor is a type of direct current electric motor where the armature and field windings are connected in series, so the same current flows through both.")
s('se_poor', SE, 'material:dc-series#p1', "A key characteristic is its poor speed regulation; the motor's speed varies significantly with load and can increase to dangerous levels if the motor runs without a load.")
s('se_uses', SE, 'material:dc-series#p1', "Crane hoists, elevators, and large excavators where a high starting torque is crucial.")

SH = 'Your motor sheet: the DC shunt motor'
s('sh_back', SH, 'material:dc-shunt#p1', "If the motor load increases, the speed initially drops, which in turn reduces the back electromotive force (EMF) generated by the armature.")
s('sh_speedback', SH, 'material:dc-shunt#p1', "This allows more current to flow to the armature, increasing the motor's torque and causing it to speed back up to compensate for the load.")
s('sh_1020', SH, 'material:dc-shunt#p1', "The motor's speed changes only slightly between no-load and full-load conditions, typically varying by 10–20%.")
s('sh_field', SH, 'material:dc-shunt#p2', "Placing a variable resistance (rheostat) in series with the field winding changes the field current and, thus, the speed. This method can achieve speeds above the motor's normal rated speed.")
s('sh_lowstart', SH, 'material:dc-shunt#p2', "Compared to series DC motors, shunt motors produce lower starting torque.")
s('sh_brush', SH, 'material:dc-shunt#p2', "Requires regular maintenance for the brushes and commutator, which can wear down over time.")
s('sh_fieldfail', SH, 'material:dc-shunt#p3', "If the field winding fails, the motor's speed can become uncontrollable, potentially leading to a runaway condition.")
s('shn_uses', SH, 'material:dc-shunt#p3', "DC shunt motors are well-suited for applications that require constant speed and moderate starting torque.")

CO = 'Your motor sheet: the DC compound motor'
s('co_def', CO, 'material:dc-compound#p1', "A DC compound motor is an electric motor that combines the characteristics of both a series-wound and a shunt-wound DC motor by using both a series field winding and a shunt field winding.")
s('co_cum', CO, 'material:dc-compound#p1', "The series and shunt fields work together, with their magnetic fluxes in the same direction.")
s('co_diff', CO, 'material:dc-compound#p1', "The magnetic fields of the series and shunt windings oppose each other. This type is rarely used because it can lead to unstable operation when the load changes.")
s('co_uses', CO, 'material:dc-compound#p1', "compound motors are used for applications like punch presses, shears, crushers, and reciprocating compressors.")

# ---------- web sources ----------
T = 'https://ww1.microchip.com/downloads/aemDocuments/documents/OTH/ApplicationNotes/ApplicationNotes/00887a.pdf'
s('mc_slip', 'AN887, AC Induction Motor Fundamentals', T, "The difference between NS and Nb is called the slip. The slip varies with the load.")
s('mc_load', 'AN887, AC Induction Motor Fundamentals', T, "An increase in load will cause the rotor to slow down or increase slip. A decrease in load will cause the rotor to speed up or decrease slip.")
s('mc_fl', 'AN887, AC Induction Motor Fundamentals', T, "Typically, the full-load slip for the squirrel cage induction motor is less than 5%.")
s('mc_sp_i', 'AN887, AC Induction Motor Fundamentals', T, "The motor draws high starting current, approximately 700% to 1,000% of the rated current.")
s('mc_sp_t', 'AN887, AC Induction Motor Fundamentals', T, "The starting torque is low, typically 100% to 175% of the rated torque.")

NID = '2-3-3. Characteristics of Induction Motors | NIDEC CORPORATION'
NIDU = 'https://www.nidec.com/en/technology/motor/basic/00027'
s('nid_rel', NID, NIDU, "To that end, there must be a relative speed difference between the magnetic field and coil.")
s('nid_slip', NID, NIDU, "Slip is normally expressed in percentage. Slip of a power induction motor is 2 to 3% when the motor is operated under the rated load.")

CU = '[PDF] CHAPTER 7 – INDUCTION MOTOR'
CUU = 'https://abs.cu.edu.tr/Dokumanlar/2017/EEE318/666957712_3_induction_machines.pdf'
s('cu_never', CU, CUU, "An induction motor can thus speed up to near synchronous speed but it can never reach synchronous speed.")
s('cu_zero', CU, CUU, "Induced Torque is zero at synchronous speed.")

AA = 'AC Machines and Rotating magnetic field'
AAU = 'https://aast.edu/pheed/staffadminview/pdf_retreive.php?stafftype=staffcourses&url=45_24985_EE328_2016_1__2_1_Lecture5.pdf'

s('br_ns', 'Electric motor - Synchronous, Rotating Fields, AC Motors | Britannica', 'https://www.britannica.com/technology/electric-motor/Synchronous-motors', "The effect of the stator current is to establish a magnetic field rotating at 120 f / p revolutions per minute for a frequency of f hertz and for p poles.")
ET = 'https://www.engineeringtoolbox.com/synchronous-motor-frequency-speed-d_649.html'
s('et_never', 'Electrical Induction Motors - Synchronous Speed', ET, "With no relative motion between stator and rotor field no voltage will be induced in the motor.")
s('et_slipdef', 'Electrical Induction Motors - Synchronous Speed', ET, "The speed of an induction motor is therefore limited to a speed below synchronous speed and the difference between synchronous speed and actual speed is called slip .")

EA = 'Motor Protection - Voltage Unbalance & Single-Phasing'
EAU = 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/fuses/solution-center/bus-ele-tech-lib-motor-single-phasing-voltage-unbalance.pdf'
s('ea_fail', EA, EAU, "Historically, the causes of motor failure can be attributed to: Overloads 30% Contaminants 19% Single-phasing 14% Bearing failure 13% Old age 10% Rotor failure 5% Miscellaneous 9% 100%")
s('ea_contacts', EA, EAU, "The number of contact kits sold each year confirms the fact that worn motor starter contacts are the most common cause of single-phasing.")
s('ie_heat', 'Causes and effects of single-phasing induction motors', 'https://ieeexplore.ieee.org/document/1307038', "the motor will heat up very quickly and it is essential that the motor be removed from service by the opening of a motor circuit breaker or some other type of protective device.")
s('ie_fuse', 'Causes and effects of single-phasing induction motors', 'https://ieeexplore.ieee.org/document/1307038', "The single-phasing can occur as a result of a fuse blowing or protective device opening on one phase of the motor.")
MG = 'The missing link in motor condition monitoring | Megger'
MGU = 'https://www.megger.com/en/et-online/may-2020/the-missing-link-in-motor-condition-monitoring'
s('mg_ir', MG, MGU, "This test will show if the motor is wet or contaminated, or if it has a dead short to earth.")
s('mg_wind', MG, MGU, "When the resistance measurements are complete, the difference between the phase-to-phase readings is calculated. A delta of less than 1% is typical for a good winding.")
s('mg_only', MG, MGU, "An insulation resistance test cannot, however, confirm that a motor is in good condition, as it does not test the entire insulation system.")

KU = '13.9: Single-phase Induction Motors'
KUU = 'https://workforce.libretexts.org/@api/deki/pages/1474/pdf/13.9%253A%2bSingle-phase%2bInduction%2bMotors.pdf'
s('ku_hand', KU, KUU, "However, it will not self-start. It may be hand started in either direction, coming up to speed in a few seconds.")
s('ku_pulse', KU, KUU, "The single coil of a single phase induction motor does not produce a rotating magnetic field, but a pulsating field")
s('ku_shift', KU, KUU, "With lower inductance and higher resistance, the current will experience less phase shift than the main winding.")
s('ku_use', KU, KUU, "This coil produces a moderate starting torque, which is disconnected by a centrifugal switch at 3/4 of synchronous speed. This simple (no capacitor) arrangement serves well for motors up to 1/3 horsepower (250 watts) driving easily started loads.")
s('ku_opt', KU, KUU, "Once started the auxiliary winding is optional.")
s('ku_cap', KU, KUU, "In Figure below a larger capacitor may be used to start a single phase induction motor via the auxiliary winding if it is switched out by a centrifugal switch once the motor is up to speed.")

MS = 'Electrical Tech Note — 313'
MSU = 'https://www.maec.msu.edu/application/files/1116/4555/7425/Tech_Note_313_Single_Phase_Motors.pdf'
s('ms_short', MS, MSU, "The auxiliary winding is not rated for continuous operation. If the motor is used on an application where it must start frequently, the auxiliary winding may overheat and fail.")
s('ms_low', MS, MSU, "This method of starting results in relatively low starting torque. Split-phase motors are suited only for fairly easy starting loads.")
s('ms_80', MS, MSU, "A centrifugal switch on the shaft disconnects the auxiliary winding when it reaches approximately 80% of full speed.")
s('ms_cap', MS, MSU, "A high value capacitor installed in series with the auxiliary winding shifts the auxiliary winding current ahead of the running winding current to achieve magnetic field rotation during starting.")
s('ms_mod', MS, MSU, "A capacitor-start motor has moderate starting torque, higher than a split-phase motor, and is suited for many applications.")
s('ms_psc', MS, MSU, "There is no centrifugal switch for this type of motor since the auxiliary winding is continuously energized.")
s('ms_shift', MS, MSU, "The current phase shift between the auxiliary winding and the main running winding is greater for a capacitor-start motor than for a split-phase motor.")

IC = 'Learn about "Capacitor Start - Induction Run" Motors'
ICU = 'https://www.idc-online.com/technical_references/pdfs/electrical_engineering/Learn_about_Capacitor_Start.pdf'
s('ic_80', IC, ICU, "the phase difference between Im and Is is almost 80 degrees as against 30 degrees in a split-phase induction motor.")
s('ic_sin', IC, ICU, "The torque developed by a split-phase induction motor is directly proportional to the sine of the angle between Is and Im.")
s('ic_twice', IC, ICU, "It is then obvious that the increase in the angle (from 30 degrees to 80 degrees) alone increases the starting torque to nearly twice the value developed by a standard split-phase induction motor.")
s('ic_lead', IC, ICU, "During starting, as the capacitor is connected in series with the starter winding, the current through the starter winding Is leads the voltage V, which is applied across the circuit.")

UT = 'ECE 3600 Single-Phase Induction Motors'
UTU = 'https://my.ece.utah.edu/~ece3600/ECE3600_Week09_F20.pdf'
s('ut_sin', UT, UTU, "Proportional to the current magnitudes and the sine of the phase angle difference between the winding currents.")
s('ut_rev', UT, UTU, "Reverse the leads to either of the windings to get the motor to start in the opposite direction.")
s('ut_need', UT, UTU, "The motor NEEDs a second winding to get started, AND the phase of the two currents NEED to be different in order to get some net rotating magnetic field.")
KW = 'How to Test a Single-Phase Motor with a Multimeter'
KWU = 'https://kaiweets.com/blogs/news/how-to-test-a-single-phase-motor-with-a-multimeter'
s('kw_cap', KW, KWU, "A failed capacitor is one of the most common causes of a motor that hums but won’t start.")
s('kw_cmp', KW, KWU, "Compare measured value with rating printed on the capacitor.")

HB1 = 'Softstarter Handbook'
HB1U = 'https://library.e.abb.com/public/6b4e1a3530814df0c12579bb0030e58b/1SFC132060M0201.pdf'
s('ab_cur', HB1, HB1U, "Usually between 6-8 times the rated current, but it can be more than 10 times the rated current.")
s('ab_tq', HB1, HB1U, "A small motor, e.g. ≤ 30 kW, normally has a value of between 1.5 and 2.5 times the rated torque")
s('ab_star', HB1, HB1U, "So when starting using Star-Delta start, the star connection results in a current of 33% compared to a delta connected motor.")
HB2 = '[PDF] SOFTSTARTER HANDBOOK - ABB'
HB2U = 'https://library.e.abb.com/public/2985284834bcff7fc1256f3a00274038/1SFC132002M0201.pdf'
s('ab4_sd', HB2, HB2U, "The received starting current is about 30 % of the starting current during direct on line start and the starting torque is reduced to about 25 % of the torque available at a D.O.L start.")
s('ab4_delta', HB2, HB2U, "The motor must be delta connected during a normal run, in order to be able to use this starting method.")
s('ab4_three', HB2, HB2U, "The device normally consists of three contactors, an overload relay and a timer for setting the time in the star-position (starting position).")
s('ab4_tq', HB2, HB2U, "A small motor, e.g. ≤ 30 kW, normally has a value of between 2.5 and 3 times the rated torque")
s('ab4_light', HB2, HB2U, "This starting method only works when the application is light loaded during the start.")
CAT = '— Softstarters PSR, PSRC, PSE and PSTX'
CATU = 'https://new.abb.com/docs/librariesprovider22/default-document-library/softstartercatalog_2022.pdf?sfvrsn=ffc5c60a_0'
s('cat_dol', CAT, CATU, "DOL starting is uncontrolled, which means that the motor will start with maximum current and torque regardless of load type.")
s('cat_sd', CAT, CATU, "The starting current is about one third compared to direct-on-line starting, although it also reduces the starting torque to about 25 percent.")
s('cat_peak', CAT, CATU, "Current peaks will happen when switching from star to delta connection.")
SG = 'Motor Starting Solutions ( en'
SGU = 'https://library.e.abb.com/public/86d98d43ec394d63841658bf28be428c/1SFC100125C0346_en_A_Solution%20Guide_%20Motor%20Starting%20Solutions.pdf?x-sign=8SIXiOql6KxHn2qO0yKzOqYZRE1MWVAffwdI2r53iwORMhU7Edf87B06zVo5EgKw'
s('sg_55', SG, SGU, "Some utilities restrict DOL starting for motors rated at 5.5 kW / 7.5 hp or higher.")
OLU = 'https://library.e.abb.com/public/8489ed224735e6cac1256faf0028b970/2CDC106014C0201.pdf'
s('ol_sc', 'Thermal Overload Relays Electronic ...', OLU, "In order to protect motors against short-circuits, it is advisable to use fuses aM in conjunction with the thermal overload relay.")
s('ol_fuse', 'Thermal Overload Relays Electronic ...', OLU, "Fuses do not protect a motor against overload. They serve only as short-circuit protection of switchgear and cables.")
SI = 'Direct-On-Line and Automatic Star – Delta Starter'
SIU = 'https://assets.new.siemens.com/siemens/assets/api/uuid:0439c3a6-f14d-4b93-bf1b-a874d46b4dd3/industrial-new-dol-11-55kwand-asd-22-55kw-operating-instruction.pdf'
s('si_coil', SI, SIU, "Check the coil voltages so that, the coil voltage corresponds to actual supply voltage.")
s('si_dis', SI, SIU, "Disconnect Power before proceeding with any work on this equipment")
s('si_reset', SI, SIU, "In this case you can restart the motor only if you reset it.")
LB = 'Manual Circuits – Basic Motor Control'
LBU = 'https://lbcc.pressbooks.pub/basicmotorcontrol/chapter/manual-circuit/'
s('lb_lvp', LB, LBU, "The unique component of the circuit, indeed the device that allows the circuit to provide low-voltage protection (LVP) , is the normally open instantaneous contact connected in parallel with the start button.")
s('lb_out', LB, LBU, "If a power outage occurs during normal operation, the starter coil will drop out and the motor will stop as well.")
s('lb_norestart', LB, LBU, "The motor will not restart without further input from an operator as the holding contact will have returned to its normally open state.")
s('lb_ol', LB, LBU, "The normally closed contacts in series with the coil are controlled by the thermal action of the overload relays, and not the movement of the armature, so they remain closed as long as an overload does not occur.")
LV = 'Low-Voltage Release vs. Low-Voltage Protection – Basic Motor Control'
LVU = 'https://lbcc.pressbooks.pub/basicmotorcontrol/chapter/lvr-lvp'
s('lv_lvp', LV, LVU, "As a rule, if a circuit uses a magnetic contactor and a holding contact, it will provide low-voltage protection (LVP).")
s('lv_lvr', LV, LVU, "If it uses maintained contacts, then it most likely provides low-voltage release (LVR).")

TG1 = '— Technical guide No. 1 Direct torque control – the world’s most advanced AC drive technology'
TG1U = 'https://library.e.abb.com/public/3dc7259dcd684a55841165ddefe7eb3f/Technical_guide_No_1_3AFE58056685_RevD_EN.pdf?x-sign=KI4w8YYG7Vw4K1NM8Xi9c4EAplW34UcpnsXTN2EbBHC8IgGbBGAQkJXlgAVXKbEs'
s('t1_vf', TG1, TG1U, "Constant magnetic flux is provided with constant V/f ratio")
s('t1_parts', TG1, TG1U, "The rectifier rectifies the fixed frequency AC voltage of the grid into DC. The inverter converts the DC voltage into variable frequency and variable voltage.")
EB = '[PDF] — ACS580 general purpose drives Technical eBook - ABB'
EBU = 'https://library.e.abb.com/public/e670a466d31e469a80e653b759f40091/ACS580_technical_eBook_3AUA0000197173%20RevB_EN.pdf'
s('eb_fw', EB, EBU, "In the field weakening range, the motor can operate on constant power which is why the field weakening range is sometimes also called the constant power range.")
s('eb_cf', EB, EBU, "The frequency range below the nominal frequency is called a constant flux range.")
s('gb_tq', 'ABB drives - Technical guide book', 'https://library.e.abb.com/public/a209d9dc29b24b789e0650b8de9c3f22/TechnicalGuideBook_EN_3AFE64514482_RevI.pdf?x-sign=W0ZwMiBJXlpbK5pdTBHsk8iNh9gEndwkkc4mRJYe1xqrUkhqZf6lBGHSZJXAmLmm', "Above the field weakening point the maximum torque decrease is inversely proportional to the square of the frequency")
M9 = 'ACIM Vector Control AN.book'
M9U = 'https://ww1.microchip.com/downloads/aemDocuments/documents/OTH/ApplicationNotes/ApplicationNotes/00908B.pdf'
s('m9_dec', M9, M9U, "As you decrease the frequency of the drive voltage, you also need to decrease the amplitude by a proportional amount. Otherwise, the motor will consume excessive current at low input frequencies.")
s('m9_prop', M9, M9U, "If the motor is not mechanically overloaded, the motor will operate at a speed that is roughly proportional to the input frequency.")
s('vc_sat', 'Overview about V/F Control-VEICHI', 'https://www.veichi.com/knowledge/v-f-control.html', "At a rated frequency, if voltage is set to a certain value and only reduce the frequency, then there will be large magnetic flux and magnetic circuit saturation (severely, it will burn motor).")
PL = 'The ABB energy efficiency & productivity improvement plan Efficient control of motor-driven applications'
PLU = 'https://new.abb.com/docs/librariesprovider53/about-downloads/energy-efficiency-productivity-plan.pdf?sfvrsn=2'
s('pl_cube', PL, PLU, "The voltage varies in proportion to the speed, so power actually varies in proportion to the cube of the speed.")
s('pl_theory', PL, PLU, "The savings derived from the Affinity Laws should be treated as theoretical. In real applications the particular characteristics of the system will determine the actual savings achieved.")
s('pl_80', PL, PLU, "Running a motor with a variable-speed drive at 80 percent speed could only require 51 percent of the energy.")
s('pl_conv', PL, PLU, "Using a variable-speed drive to reduce a conveyors speed from 100 percent to 80 percent, saves 20 percent in energy. But with a pump or a fan, the same speed reduction means the saving is closer to 50 percent.")
s('rv_cube', '0908 ENG ABB 4-04', 'https://library.e.abb.com/public/be6ebccd4fc05424c1256f57003ba84a/34-38%204M892.pdf', "To be more specific, the power required to run a pump is proportional to the cube of the speed.")
DOE = 'Adjustable Speed Drive Part-Load Efficiency'
DOEU = 'https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/motor_tip_sheet11.pdf'
s('b5_bear', 'ABB drives - Technical guide No. 5 - Bearing currents in modern AC drive systems', 'https://library.e.abb.com/public/8c253c2417ed0238c125788f003cca8e/ABB_Technical_guide_No5_RevC.pdf', "This is because modern variable speed drives with their fast rising voltage pulses and high switching frequencies can cause current pulses through the bearings whose repeated discharging can gradually erode the bearing races.")
FC = '10 most common fault codes and how to solve'
FCU = 'https://www.eaton.com/content/dam/eaton/products/industrialcontrols-drives-automation-sensors/variable-frequency-drives/vfd-training/services/10-most-common-fault-codes-and-how-to-solve.pdf'
s('fc_harm', FC, FCU, "Excess harmonics may be overcharging DC link capacitors.")
PX = 'PowerXL series trouble shooting guide AP050085EN'
PXU = 'https://www.eaton.com/content/dam/eaton/products/industrialcontrols-drives-automation-sensors/variable-frequency-drives/powerxl-dm1-variable-frequency-drives/powerxl-series-troubleshooting-guide-ap050085en.pdf'
s('px_decel', PX, PXU, "If the drives deceleration time is too fast, the drive will not react fast enough and the drive will trip out on an over voltage trip.")
s('px_earth', PX, PXU, "The earth fault is a software function that monitors the sum of all of the output currents.")
PE = 'VFD Ground Fault Trip and Short-Circuit Faults: Causes, Detection, and Best Practices'
PEU = 'https://www.precision-elec.com/wp-content/uploads/2025/06/VFD-Ground-Fault-Trip-and-Short-Circuit-Faults-Causes-Detection-and-Best-Practices.pdf'
s('pe_megger', PE, PEU, "Best practice: Always disconnect the drive completely before meggering the motor or cable.")
s('pe_hv', PE, PEU, "High-voltage DC from an insulation tester can damage VFD electronic components or give misleading readings through the drive’s input filters.")
s('pe_moist', PE, PEU, "Moisture is a frequent culprit in VFD earth fault causes – when a motor sits idle in a humid environment, condensation can form on the windings or in junction boxes.")

s('bo_marine', 'The Induction Machine Handbook', 'https://web.mit.edu/kirtley/binlustuff/literature/electric%20machine/InductionMachineHandbook.pdf', "Induction motors are extensively used in marine environments for pumps, fans, compressors, etc. for power up to 700 kW or more.")
s('bo_enclosed', 'The Induction Machine Handbook', 'https://web.mit.edu/kirtley/binlustuff/literature/electric%20machine/InductionMachineHandbook.pdf', "Due to the aggressive environment, they are totally enclosed and may have aluminum (at low power), steel, or cast iron frames")
s('dt_t45', 'An Evaluation of Electric Motors for Ship Propulsion - DTIC', 'https://apps.dtic.mil/sti/tr/pdf/ADA417341.pdf', "The U.K. has also selected the induction motor to be the prime mover in their Type-45 destroyer.")
s('iv_marine', 'Variable Frequency Drives in the Marine Industry', 'https://www.invertekdrives.com/vfd-industries/marine', "Invertek variable frequency Drives (VFD) allow precise, reliable and efficient control of electric motors in a wide variety of onboard applications, including cranes, winches, bow thrusters, ventilation, pumps and compressors.")
s('abb_haz', 'Motors for hazardous areas | ABB UK', 'https://www.abb.com/gb/en/areas/motion/motors-generators/low-voltage-motors/iec-low-voltage-motors/motors-for-explosive-atmospheres', "Our motors are rigorously engineered to prevent ignition in hazardous locations by eliminating sources of sparks, arcing, or excessive heat.")
s('wk_univ', 'Universal motor - Wikipedia', 'https://en.wikipedia.org/wiki/Series-wound_motor', "The universal motor is a type of electric motor that can operate on either AC or DC power and uses an electromagnet as its stator to create its magnetic field.")

OX = '23.6 Back Emf - College Physics for AP® Courses 2e | OpenStax'
OXU = 'https://openstax.org/books/college-physics-ap-courses-2e/pages/23-6-back-emf'
s('ox_zero', OX, OXU, "It is zero when the motor is first turned on, meaning that the coil receives the full driving voltage and the motor draws maximum current when it is on but not turning.")
s('ox_load', OX, OXU, "When a mechanical load is placed on the motor, like an electric wheelchair going up a hill, the motor slows, the back emf drops, more current flows, and more work can be done.")
s('ox_noload', OX, OXU, "On the other hand, if there is no mechanical load on the motor, it will increase its angular velocity until the back emf is nearly equal to the driving emf.")
s('ox_gen', OX, OXU, "The motor thus acts as a generator whenever its coil rotates.")
s('up_diff', '13.6 Electric Generators and Back Emf - University Physics Volume 2 | OpenStax', 'https://openstax.org/books/university-physics-volume-2/pages/13-6-electric-generators-and-back-emf', "The back emf is calculated based on the difference between the supplied voltage and the loss from the current through the resistance.")
P8 = 'Part 8 – DC Motor Starters – PEG-3722 Electrotechnology'
P8U = 'https://ecampusontario.pressbooks.pub/electrotechnology/chapter/part-8-dc-motor-starters'
s('p8_start', P8, P8U, "At the moment a DC motor is started the armature is stationary therefore no counter EMF is being generated.")
s('p8_res', P8, P8U, "In order to reduce this very high starting current, an external resistance must be placed in series with the armature during the starting period.")
P7 = 'Part 7 – DC Motors – PEG-3722 Electrotechnology'
P7U = 'https://ecampusontario.pressbooks.pub/electrotechnology/chapter/part-7-dc-motors/'
s('p7_series', P7, P7U, "Series motors are known for their exceptional ability to generate substantial torque when starting from a standstill.")
s('p7_run', P7, P7U, "Speed continues to increase until the physical force of rotation damages the motor.")
s('p7_cumsafe', P7, P7U, "In a cumulative compound motor, there is a distinct no-load speed, and it can be safely operated under such conditions.")
s('p7_shlow', P7, P7U, "Shunt motors do not have good starting torque because the shunt field overrides the series field.")
s('p7_cumdef', P7, P7U, "Cumulative compound motors feature a shunt field winding and a series field winding that are wound in the same direction.")
s('p7_reg', P7, P7U, "However, when it comes to speed regulation, cumulative compound motors are not as effective as shunt motors.")
s('p7_rheo', P7, P7U, "The most common and preferred method is placing a rheostat in series with the field winding rather than using an armature rheostat.")
RH = '[PDF] 25-1 DC motors DC motors are important in many applications. In ...'
RHU = 'https://www.rose-hulman.edu/class/ee/HTML/NSF/CCLI_EMD_DUE_0088904/PDFS/lecture_notes_25.pdf'
s('rh_sq', RH, RHU, "This results in the developed torque being proportional to the square of the armature current.")
s('rh_lin', RH, RHU, "If we assume the machine is working in its linear region,")
s('rh_start', RH, RHU, "Series motors develop very high starting torque because of the large starting current in motors.")
s('rh_over', RH, RHU, "If the motor load is lost, TD will get quite small, causing Ia to become small which, in turn, results in overspeeding the motor. Series motors must always be fitted with overspeed protection.")
s('rh_safe', RH, RHU, "However, the shunt, or separately-excited, motor has a safe no-load speed, providing that the field circuit is not de-energized.")
s('rh_lof', RH, RHU, "Loss-of-field protection is usually provided to guard against overspeeding.")
s('rh_hi', RH, RHU, "The starting torque is as high as in the series motor.")
s('rh_lim', RH, RHU, "Starting currents often have to be limited to prevent electrical and mechanical damage.")
IDC = 'Classes, Speed Control and Starting of DC motors'
IDCU = 'https://www.idc-online.com/technical_references/pdfs/electrical_engineering/Classes_Speed_Control_and_Starting_of_Dc_motors.pdf'
s('id_coupled', IDC, IDCU, "This type of DC motor is only used for direct coupling and other work where the load ( or part of the load ) is permanently coupled to the motor.")
s('id_danger', IDC, IDCU, "This will be seen from the speed-torque characteristic, which shows that on no load or light load the speed will be very high and therefore dangerous.")
s('id_const', IDC, IDCU, "Its speed is nearly constant, falling off as the load increases due to resistance drop and armature reaction.")
s('id_710', IDC, IDCU, "Speed control obtained in this way is extremely stable and the speed regulation between no load and full load at any particular setting is from 7 to 10%, depending on the size and design of the equipment.")
s('id_start', IDC, IDCU, "it is most important to see that the shunt rheostat ( for speed control ) is in the slow-speed position.")
s('id_start2', IDC, IDCU, "This is because the starting torque is proportional to the field current and this field current must be at its maximum value for starting purposes.")
s('id_field', IDC, IDCU, "Speed regulation on shunt and compound-wound motors is obtained by resistance in series with the shunt-field winding only.")
s('id_comp', IDC, IDCU, "The relative proportions of the shunt and series winding can be varied in order to make the characteristics nearer those of the series motor or those of the shunt-wound motor.")
ED = 'DC series motor caution - EDN'
EDU = 'https://www.edn.com/dc-series-motor-caution'
s('ed_belt', ED, EDU, "It is stridently recommended that any mechanical load being driven by a DC series motor be coupled to that motor by a gear mechanism and never by a belt because a belt can break.")
s('ed_safe', ED, EDU, "A DC shunt motor or a DC compound motor can be safely operated without a mechanical load (separate discussions), but a DC series motor CANNOT be safely operated that way.")
s('si_fieldfull', 'Lesson 15: Dc Motor Control Components and Diagrams', 'https://www.engr.siu.edu/staff2/spezia/Web332A/Lecture%20Notes/Lesson%2015%20332ac.pdf', "Note: that the field rheostat is shorted out by contact FA while the motor is starting. Motor will accelerate to running speed with full field current applied.")
s('siu_reg', '18 NO. EXPERIMENT', 'https://engr.siu.edu/staff/spezia/Web332A/Labs/Lab%206.pdf', "It is computed by dividing the change in speed by the full load speed.")
MT = 'CHAPTER 11'
MTU2 = 'https://pages.mtu.edu/~avsergue/EET2233/Lectures/CHAPTER11.pdf'
s('mt_add', MT, MTU2, "If a shunt coil is added to a series motor at light loads (when a series motor tends to overspeed) the added shunt field flux limits the top speed, eliminating self-destruction.")
s('mt_long', MT, MTU2, "The long-shunt connection : the shunt winding is located directly across the terminals of the machine, and the series winding is connected between the shunt and the armature.")
s('mt_short', MT, MTU2, "The short-shunt connection : the shunt winding is directly in parallel with the armature, and the series winding is between the shunt winding and the terminals of the machine.")
s('mt_aid', MT, MTU2, "The short or the long shunt can be connected so that the two fields reinforce each other - cumulative compounding or so that they are in opposition to each other - differential compounding")
s('mt_run', MT, MTU2, "The series motor produces very high starting torque and will run away at no load.")
s('ea_diff', 'Characteristics of DC motors | electricaleasy.com', 'https://www.electricaleasy.com/2014/07/characteristics-of-dc-motors.html', "Since in differential field motors, series flux opposes shunt flux, the total flux decreases with increase in load.")
CB = 'What is the Difference between DC Series, DC Shunt, and DC Compound Motors? | CircuitBread'
CBU = 'https://www.circuitbread.com/ee-faq/difference-between-dcseries-dcshunt-and-dccompound-motors'
s('cb_safe', CB, CBU, "The shunt field flux of the compound motor maintains enough flux at starting to guarantee a safe no-load operating speed unlike the DC series motor.")
s('cb_flux', CB, CBU, "In other words, speed is greater when there is lower field flux.")
s('cb_rare', CB, CBU, "The former is rarely used hence we will limit our discussion only to the cumulatively compounded DC motors.")
DD = 'ELECTRICAL SYSTEMS AND SAFETY OVERSIGHT QUALIFICATION STANDARD REFERENCE GUIDE'
DDU = 'https://www.energy.gov/sites/default/files/2013/10/f4/QSR-ElectricalSafetySystems.pdf'
s('dd_fw', DD, DDU, "If the field flux of a DC motor is decreased, the motor speed will increase.")
s('dd_series', DD, DDU, "As load is removed from a series motor, the speed will increase sharply.")
s('dd_comp', DD, DDU, "The compounded motor has a greater torque than a shunt motor due to the series field; however, it has a fairly constant speed due to the shunt field winding.")

s('rev_abb', '[PDF] — Baldor-Reliance ® Integral Horsepower AC Induction Motors - ABB', 'https://library.e.abb.com/public/1b412697e30b440b9d3a8c5833ae3309/MN408.pdf', "To reverse the direction of rotation, disconnect and lock out power and interchange any two of the three line leads for three phase motors.")
s('rev_btc', 'Forward/Reverse Control Circuits – Basic Motor Control', 'https://opentextbc.ca/basicmotorcontrol/chapter/forward-reverse-control-circuits/', "all that is needed is to interchange any two of the three line leads feeding the motor.")
s('abb_haz2', 'Motors for hazardous areas | ABB UK', 'https://www.abb.com/gb/en/areas/motion/motors-generators/low-voltage-motors/iec-low-voltage-motors/motors-for-explosive-atmospheres', "Fully ATEX and IECEx certified, these motors are compliant with the latest global and regional safety standards")
s('ut_ideal', UT, 'https://my.ece.utah.edu/~ece3600/ECE3600_Week09_F20.pdf', "Ideally, choose a capacitor so that the current through the second winding (IS) leads the current through the main winding (IM) by 90 o at startup (s = 1).")
s('et_cube', 'Variable frequency drives: energy savings for pumping applications', 'https://www.eaton.com/content/dam/eaton/markets/machinebuilding/Variable%20frequency%20drives_%20energy%20savings%20for%20pumping%20applications.pdf', "If speed decreases by 50%, power consumption decreases to 12.5%")
s('fc_dec2', FC, FCU, "Fault occurs during deceleration or when motor is over run")
s('fc_dec3', FC, FCU, "Increase deceleration time or add brake chopper")
s('cb_5', CB, CBU, "The I a R a drop even at full loads is about 5%.")
s('ea_diff2', 'Characteristics of DC motors | electricaleasy.com', 'https://www.electricaleasy.com/2014/07/characteristics-of-dc-motors.html', "Due to this, the speed remains almost constant or even it may increase slightly with increase in load")
s('lv_def', LV, LVU, "low-voltage protection (LVP) is a property that circuits have when upon a return of voltage following a power outage, loads will not automatically turn back on and will require further input from the operator.")

s('sp_90', SP, 'material:split-phase#p1', "a type of single-phase motor that uses two stator windings—a main winding and a starting (or auxiliary) winding—displaced by 90 degrees.")
s('ic_main', IC, ICU, "But the current through the main winding Im, still lags the applied voltage V across the circuit.")

# ---------- notes ----------
def N(claim, keys, contested=None):
    d = {'claim': claim, 'keys': keys}
    if contested: d['contested'] = contested
    return d

NOTES = {
 'topic': [
  N("The synchronous speed of the turning field is 120 f / p rpm for f hertz and p poles; an induction motor's shaft runs a little slower than it.", ['br_ns', 'et_slipdef']),
  N("In a series motor the same current flows through field and armature, and its speed can climb to dangerous levels if it runs without a load.", ['se_series', 'se_poor']),
  N("A motor that is turning also acts as a generator; the emf it makes is called back emf and it opposes the supply.", ['ox_gen', 'ox_zero']),
 ],
 'i1': [
  N("Three windings 120 electrical degrees apart, each fed from one phase, make one combined magnetic field that turns at a constant speed, the synchronous speed.", ['ind_field']),
  N("The turning field cuts the short-circuited rotor conductors and induces a current in them; that current makes its own field, which interacts with the stator field to give torque.", ['ind_cut', 'ind_torque']),
  N("The rotor has to turn slower than the field: with no speed difference there is no cutting, so no current is induced and no torque is produced. An induction motor can approach synchronous speed but never reach it.", ['ind_noslip', 'nid_rel', 'et_never', 'cu_never', 'cu_zero']),
  N("Slip is the difference between synchronous and actual speed, normally written as a percentage. Load makes the rotor slow and slip grow; taking load off lets it speed up and slip shrink.", ['et_slipdef', 'nid_slip', 'mc_slip', 'mc_load']),
  N("Synchronous speed is 120 f / p rpm for f hertz and p poles.", ['br_ns']),
  N("Full-load slip of a cage motor is a few percent: about 2 to 3% (one maker) and under 5% (another).", ['nid_slip', 'mc_fl']),
  N("Starting from the supply direct, a motor draws usually 6 to 8 times its rated current and can draw more than 10 times.", ['ab_cur', 'dw_inrush']),
  N("For a small motor (up to about 30 kW) ABB's 2010 handbook gives a direct-on-line starting torque of 1.5 to 2.5 times rated; its 2004 edition gave 2.5 to 3. The figure is a range.", ['ab_tq', 'ab4_tq']),
  N("Swapping the supply connections on any two of the three coils reverses the field and so the direction of rotation.", ['rev_abb', 'rev_btc']),
  N("A cage rotor is simple, rugged and low-maintenance, with no brushes or slip rings; a wound rotor gives higher starting torque and speed control by external resistance, at more upkeep. Light load gives a poor power factor.", ['ind_cage', 'ind_wound', 'ind_pf']),
  N("Cage induction motors suit constant-speed work such as fans, pumps, conveyors and compressors; their speed is hard to control without a drive and their starting current is high.", ['ind_uses', 'ind_speedctl', 'ind_inrush']),
  N("Induction motors are used on ships for pumps, fans and compressors up to 700 kW or more, totally enclosed; the UK chose an induction motor to drive its Type 45 destroyer.", ['bo_marine', 'bo_enclosed', 'dt_t45']),
  N("A three-phase motor run from a single phase will not self-start but can be hand started; a motor already running when one phase is lost heats very quickly and must be taken off by its protection.", ['ku_hand', 'ie_heat', 'ie_fuse']),
  N("In one long-run record of motor failures, overloads were 30%, single-phasing 14% and bearing failure 13%; worn starter contacts are given as the most common cause of single-phasing.", ['ea_fail', 'ea_contacts']),
  N("An insulation resistance test shows a wet or contaminated motor or a dead short to earth but cannot prove it good; a winding resistance test compares phases, and under 1% difference is typical of a good winding.", ['mg_ir', 'mg_wind', 'mg_only']),
  N("His sheet says a brushless motor is safe for hazardous areas; a maker builds hazardous-area motors to prevent ignition and certifies them to ATEX and IECEx.", ['ind_expl', 'abb_haz', 'abb_haz2'], "Dan's sheet treats the absence of brushes as making these motors safe in hazardous areas; a maker presents certified, purpose-built motors for these areas."),
 ],
 'i2': [
  N("The isolator closes the supply; Start (normally open, sprung) makes the coil circuit; the coil pulls in the main contacts, and a latching contact across Start keeps the coil fed once Start is released.", ['sh_isol', 'sh_sprung', 'sh_start', 'dw_close', 'lb_lvp']),
  N("Stop (normally closed) breaks the coil circuit, and so does the overload's release contact after its bimetal strips bend; the coil drops out and the contacts release.", ['sh_makes', 'sh_ol', 'sh_9_10', 'sh_drop']),
  N("The coil does the pulling and holding of the main contacts; the latching contact's job is to keep the coil fed. (His sheet's item 7 words it as the latching contacts pulling and holding the main contacts.)", ['sh_start', 'sh_latch', 'lb_lvp']),
  N("After a power cut the coil drops out and the motor stops; it does not restart by itself, because the holding contact has returned to open. A contactor with a holding contact gives low-voltage protection; maintained contacts give low-voltage release.", ['lb_out', 'lb_norestart', 'lv_lvp', 'lv_lvr', 'lv_def']),
  N("The overload's contacts sit in series with the coil and are operated by heat, not by the contactor's movement.", ['lb_ol']),
  N("Overload relays protect against overload only: fuses or a breaker give the short-circuit protection, and a maker advises fuses with the thermal overload relay.", ['ol_fuse', 'ol_sc', 'dw_fuse']),
  N("His coil is 230 V, fed from one phase and neutral; the coil rating must be right for how it is connected and for the supply voltage.", ['sh_coil', 'hb_coil', 'si_coil']),
  N("Direct-on-line starting is uncontrolled: full current and torque from the start. Start current is usually 6 to 8 times rated and can exceed 10 times.", ['cat_dol', 'ab_cur', 'dw_inrush']),
  N("His sheet gives DOL up to 5 kW; the web summary gives often under 4 kW; ABB says the limit depends on the area of use, and some utilities restrict DOL starting for motors of 5.5 kW or higher.", ['sh_5kw', 'dw_4kw', 'sg_55'], "Rules of thumb for the largest DOL motor differ (5 kW, under 4 kW, 5.5 kW); the maker says it depends on the area of use and gives 5.5 kW as one utility limit."),
  N("DOL starters are used for compressors, pumps and fans; repeated stopping and starting can make the thermal overload operate.", ['sh_uses', 'sh_thermal']),
  N("Star-delta cuts starting current to about 30% (a third) and starting torque to about 25% of direct-on-line; the motor must be delta connected when running, and the starter uses three contactors, an overload and a timer.", ['ab4_sd', 'cat_sd', 'ab_star', 'ab4_delta', 'ab4_three']),
  N("Star-delta works only when the load is light at the start, and there are current peaks at the switch from star to delta.", ['ab4_light', 'cat_peak']),
  N("His group's star-delta worked answer multiplies the star power by 3 to get the delta power.", ['hsd_x3']),
  N("The web summary's wording that DOL gives 100% of rated torque is loose: ABB gives full starting torque as 1.5 to 2.5 times rated for a small motor.", ['dw_100', 'ab_tq']),
  N("His group handout says that start buttons are wired in parallel.", ['hb_par']),
  N("Isolate and prove dead before work on a starter: the maker's own instruction is to disconnect power before any work on the equipment.", ['si_dis']),
 ],
 'i3': [
  N("A drive has three parts: a rectifier turns AC to DC, a DC bus with capacitors smooths it, and an inverter switches it back to AC at chosen frequency and voltage by pulse-width modulation.", ['vs_rect', 'vs_bus', 'vs_pwm', 't1_parts']),
  N("Motor speed follows the supply frequency, so a drive that sets the frequency sets the speed.", ['m9_prop', 'br_ns']),
  N("Voltage is lowered in proportion to frequency so the flux stays constant (constant V/f); otherwise the motor draws excessive current at low frequency, with saturation.", ['t1_vf', 'm9_dec', 'vc_sat']),
  N("Below the nominal frequency is the constant flux range; above it the voltage can rise no further and the motor is in field weakening, where it can run at constant power, so maximum torque falls with frequency.", ['eb_cf', 'eb_fw', 'gb_tq']),
  N("A drive's soft start removes the inrush of a direct start and the mechanical shock.", ['vs_soft']),
  N("For fans and pumps power varies roughly as the cube of speed: half speed needs about one eighth power in theory; a maker says treat the savings as theoretical.", ['pl_cube', 'rv_cube', 'et_cube', 'pl_theory']),
  N("Slowing a conveyor from 100% to 80% saves 20% of energy while a pump or fan saves nearer 50%, so savings are large only on variable-torque loads.", ['pl_conv', 'pl_80']),
  N("VFDs on ships are used on cranes, winches, bow thrusters, ventilation, pumps and compressors (a maker's list).", ['iv_marine', 'vs_marine']),
  N("Fast-rising voltage pulses and high switching frequencies of modern drives can send current pulses through motor bearings that erode the races.", ['b5_bear']),
  N("A drive trip on over-voltage during stopping can come from regenerated energy: the fix named is a longer deceleration time or a brake chopper; harmonics can also overcharge the DC link capacitors.", ['fc_dec2', 'fc_dec3', 'px_decel', 'fc_harm']),
  N("Earth-fault trips are found from the sum of the output currents and often from weak or damp insulation; disconnect the drive before an insulation resistance test on the motor and cable.", ['px_earth', 'pe_moist', 'pe_megger', 'pe_hv']),
 ],
 'i4': [
  N("One single-phase winding makes a pulsating field, not a turning one, so it gives no starting torque; a three-phase motor on one phase will not self-start but can be hand started either way.", ['ku_pulse', 'ut_need', 'ku_hand']),
  N("A start winding at 90 electrical degrees, with thinner wire and fewer turns, has higher resistance and lower inductance, so its current shifts less than the main winding's; the two currents are out of step and the field turns.", ['sp_90', 'sp_wire', 'ku_shift', 'sp_lead']),
  N("The angle between the two currents in a split-phase motor is about 30 degrees.", ['ic_80']),
  N("Starting torque goes with the currents and the sine of the angle between them.", ['ic_sin', 'ut_sin']),
  N("A centrifugal switch drops the start winding out: at 3/4 of synchronous speed (Kuphaldt), about 75% of running speed (his sheet), approximately 80% of full speed (MSU).", ['sp_switch', 'ku_use', 'ms_80']),
  N("Split-phase starting torque is low and suits easily started loads and fractional horsepower, up to 1/3 horsepower (250 W); typical figures are 100 to 175% of rated torque and 700 to 1,000% of rated current.", ['ms_low', 'ku_use', 'sp_uses', 'mc_sp_t', 'mc_sp_i']),
  N("The start winding is not rated for continuous use, so frequent starts or a long start can overheat and burn it out.", ['ms_short']),
  N("Once started the auxiliary winding is optional; the main winding alone keeps the motor running.", ['ku_opt', 'sp_switch']),
  N("The direction is set by reversing the leads of one winding (start or main) before starting.", ['ut_rev']),
 ],
 'i5': [
  N("A capacitor in series with the start winding makes that winding's current lead the supply voltage, while the main winding's current still lags, so the angle between the currents grows.", ['ic_lead', 'ic_main', 'ms_cap', 'cs_phase']),
  N("The angle is almost 80 degrees against about 30 degrees in a split-phase motor; ideally the capacitor is chosen so the start winding's current leads the main winding's by 90 degrees at startup.", ['ic_80', 'ut_ideal']),
  N("Starting torque goes with the sine of the angle between the currents, so going from 30 to 80 degrees alone raises starting torque to nearly twice that of a split-phase motor.", ['ic_sin', 'ic_twice']),
  N("A capacitor-start motor has moderate starting torque, higher than split-phase, and the phase shift is greater.", ['ms_mod', 'ms_shift', 'cs_heavy']),
  N("The centrifugal switch takes the start winding and capacitor out at about 75 to 80% of speed.", ['cs_switch', 'ic_80']),
  N("The motor then runs on the main winding alone. His sheet credits 'momentum from the startup'; the fuller source says the auxiliary winding is optional once started.", ['cs_mom', 'ku_opt']),
  N("A permanent-split capacitor motor keeps a continuously energised auxiliary winding and has no centrifugal switch; a larger capacitor can be used just for starting if switched out at speed.", ['ms_psc', 'ku_cap']),
  N("A failed capacitor is one of the most common causes of a motor that hums but will not start; compare a measured capacitor value with its marked rating.", ['kw_cap', 'kw_cmp']),
 ],
 'i6': [
  N("In a series motor the same current flows through field and armature.", ['se_series']),
  N("A turning armature makes a back emf opposing the supply; it is zero at standstill, so a motor not yet turning draws maximum current, and a load that slows it drops the back emf and raises the current.", ['ox_zero', 'ox_load', 'ox_gen', 'p8_start']),
  N("The armature current is limited at start by armature resistance alone, so an external starting resistance is placed in series with the armature.", ['p8_start', 'p8_res', 'rh_lim']),
  N("The motor's back emf is the supply voltage less the voltage lost in the resistance.", ['up_diff']),
  N("In its linear (unsaturated) region a series motor's torque goes with the square of the armature current, so it has very high starting torque.", ['rh_lin', 'rh_sq', 'rh_start', 'p7_series']),
  N("Remove the load and the current falls, the field weakens, and the speed rises towards destruction: series motors must have overspeed protection and be coupled directly, never belt driven.", ['rh_over', 'p7_run', 'id_coupled', 'id_danger', 'ed_belt']),
  N("A shunt or compound motor can be run safely with no load but a series motor cannot.", ['ed_safe', 'ox_noload']),
  N("A series motor suits crane hoists, elevators and large excavators, where a high starting torque is crucial.", ['se_uses']),
  N("A universal motor can operate on either AC or DC power and uses an electromagnet as its stator.", ['wk_univ']),
 ],
 'i7': [
  N("In a shunt motor the field is across the supply, so its current and flux stay steady.", ['sh_back', 'cb_safe']),
  N("A heavier load slows the motor, which lowers the back emf, lets more armature current flow and raises the torque; the speed settles a little lower than before.", ['sh_back', 'ox_load', 'id_const']),
  N("His sheet says the extra current makes the motor 'speed back up to compensate'; the fuller sources say the speed falls off as the load increases.", ['sh_speedback', 'id_const'], "Dan's sheet says a loaded shunt motor speeds back up to compensate; textbooks say its speed is nearly constant but falls off as load increases."),
  N("Speed regulation is the change in speed from no load to full load divided by the full-load speed; sources differ: his sheet 10 to 20%, IDC 7 to 10%, one site puts the armature drop at about 5%.", ['siu_reg', 'sh_1020', 'id_710', 'cb_5'], "Sources differ on how far a shunt motor's speed falls between no load and full load: 10-20% (his sheet), 7-10% (IDC), about 5% (a circuits site)."),
  N("Weakening the field raises the speed: a rheostat in series with the shunt field gives speeds above rated, and is the usual method.", ['cb_flux', 'dd_fw', 'sh_field', 'p7_rheo', 'id_field']),
  N("Start a shunt motor with the field rheostat in the slow-speed position, so the field current is at its maximum: starting torque goes with field current.", ['id_start', 'si_fieldfull']),
  N("Lower starting torque than a series motor: his sheet and a text say so, while Rose-Hulman says the starting torque is as high as in the series motor.", ['sh_lowstart', 'p7_shlow', 'rh_hi'], "Whether a shunt motor's starting torque is lower than a series motor's: his sheet and PEG-3722 say lower; Rose-Hulman says as high."),
  N("A shunt motor has a safe no-load speed as long as the field is not de-energised; if the field fails the speed can run away, so loss-of-field protection is usual.", ['rh_safe', 'rh_lof', 'sh_fieldfail']),
  N("Brushes and commutator need regular maintenance.", ['sh_brush']),
  N("Shunt motors suit constant-speed work such as machine tools and pumps.", ['shn_uses']),
 ],
 'i8': [
  N("A compound motor has both a series and a shunt field winding.", ['co_def']),
  N("In a cumulative compound motor the series and shunt fields work together, with fluxes in the same direction; in a differential one they oppose.", ['co_cum', 'mt_aid', 'co_diff']),
  N("A shunt coil added to a series motor limits the top speed at light load, and a cumulative compound motor has a definite no-load speed and can run safely with no load.", ['mt_add', 'cb_safe', 'p7_cumsafe']),
  N("A cumulative compound motor has more starting torque than a shunt motor and steadier speed than a series motor, but not as steady as a shunt motor.", ['dd_comp', 'p7_reg', 'id_comp']),
  N("A differential compound motor is rarely used because it can run unstably when the load changes; because the series flux opposes the shunt flux, flux falls with load and the speed can rise with load.", ['co_diff', 'ea_diff', 'ea_diff2', 'cb_rare']),
  N("A long-shunt connection puts the shunt winding across the supply with the series winding between it and the armature; a short-shunt connection puts the shunt winding across the armature only.", ['mt_long', 'mt_short']),
  N("Compound motors suit presses, shears, crushers and reciprocating compressors.", ['co_uses']),
 ],
}

# ---------- assemble ----------
order = []
def num(k):
    if k not in S: raise SystemExit('missing source key ' + k)
    if k not in order: order.append(k)
    return order.index(k) + 1

def conv(lst):
    out = []
    for d in lst:
        nd = {'claim': d['claim'], 'sourceIds': sorted({num(k) for k in d['keys']})}
        if 'contested' in d: nd['contested'] = d['contested']
        out.append(nd)
    return out

ideas = {k: {'notes': conv(NOTES[k])} for k in ['i1','i2','i3','i4','i5','i6','i7','i8']}
topic = {'notes': conv(NOTES['topic'])}
sources = [{'n': i + 1, 'title': S[k][0], 'url': S[k][1], 'quote': S[k][2]} for i, k in enumerate(order)]
# add unused sources? none: only cited ones are kept
out = {'sources': sources, 'topic': topic, 'ideas': ideas}
open('/home/user/Study-App/build/electrical/motors/research.reply.txt', 'w', encoding='utf8').write(json.dumps(out, ensure_ascii=False, indent=1))
json.dump([{'title': x['title'], 'url': x['url'], 'quote': x['quote']} for x in sources], open('/home/user/Study-App/build/electrical/motors/scratch/quotes.json', 'w', encoding='utf8'), ensure_ascii=False)
print(len(sources), 'sources;', sum(len(v['notes']) for v in ideas.values()), 'notes')
