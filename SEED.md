# TotoTrack — Demo Seed Data

Visit `/setup` and click **Seed Demo Data** to create all accounts and data below.

---

## School

| Field | Value |
|---|---|
| Name | Westlands Academy |
| Tier | Growth |
| Route | Westlands → Sarit Centre → ABC Place → Ngong Road → Karen |

---

## Demo Accounts (all password: `password`)

### Parents

| Name | Email | Child |
|---|---|---|
| Grace Wekesa | `grace.wekesa@demo.tototrack` | Amani Wekesa |
| James Otieno | `james.otieno@demo.tototrack` | Zawadi Otieno |
| Mary Mwangi | `mary.mwangi@demo.tototrack` | Baraka Mwangi |
| Peter Kamau | `peter.kamau@demo.tototrack` | Imani Kamau |

### Drivers

| Name | Email | Bus |
|---|---|---|
| James Mwangi | `driver.kca@demo.tototrack` | KCA-123Y |
| Peter Kamau | `driver.kbz@demo.tototrack` | KBZ-456X |

---

## Buses & Children

### Bus KCA-123Y (Plate: KCA 123Y) — Driver: James Mwangi

| Child | Grade | Stop | Parent |
|---|---|---|---|
| Amani Wekesa | Grade 4 | Westlands | Grace Wekesa |
| Zawadi Otieno | Grade 3 | Sarit Centre | James Otieno |

### Bus KBZ-456X (Plate: KBZ 456X) — Driver: Peter Kamau

| Child | Grade | Stop | Parent |
|---|---|---|---|
| Baraka Mwangi | Grade 5 | Karen | Mary Mwangi |
| Imani Kamau | Grade 2 | Ngong Road Junction | Peter Kamau |

---

## Route Stops (Westlands → Karen)

| Order | Stop | Lat | Lng |
|---|---|---|---|
| 0 | Westlands | -1.2636 | 36.8104 |
| 1 | Sarit Centre | -1.2587 | 36.8067 |
| 2 | ABC Place Junction | -1.2631 | 36.7980 |
| 3 | Ngong Road Junction | -1.2897 | 36.7927 |
| 4 | Karen | -1.3191 | 36.7117 |

---

## After Seeding

- **Admin dashboard** `/` — map shows 2 buses at their start stops
- **Simulator** `/setup` → Start (10s) — buses move along the route
- **Trigger anomaly** `/setup` → Trigger Anomaly — bus goes red, alert fires
- **Driver view** `/driver/KCA-123Y` — tap Confirm Boarded to update status + send SMS
- **Parent view** `/parent` — sign in as any parent above to see their child's status
