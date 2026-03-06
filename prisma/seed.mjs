import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createMonthData({ year, month, incomes, fixedExpenses, variableExpenses, debts }) {
  return prisma.month.create({
    data: {
      year,
      month,
      incomes: { create: incomes },
      fixedExpenses: { create: fixedExpenses },
      variableExpenses: { create: variableExpenses },
      debts: { create: debts },
    },
  });
}

async function main() {
  await prisma.variableExpense.deleteMany();
  await prisma.fixedExpense.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.income.deleteMany();
  await prisma.month.deleteMany();

  await createMonthData({
    year: 2026,
    month: 1,
    incomes: [
      { source: "Nómina principal", amount: 2200 },
      { source: "Freelance", amount: 450 },
    ],
    fixedExpenses: [
      { name: "Alquiler", amount: 900, status: "LIQUIDADO" },
      { name: "Luz/agua/gas", amount: 190, status: "LIQUIDADO" },
      { name: "Comida", amount: 420, status: "PENDIENTE" },
      { name: "Vodafone", amount: 55, status: "LIQUIDADO" },
    ],
    variableExpenses: [
      { name: "Seguro coche", amount: 320, status: "LIQUIDADO", category: "Transporte", date: new Date("2026-01-05") },
      { name: "Parking", amount: 48, status: "PENDIENTE", category: "Transporte", date: new Date("2026-01-09") },
      { name: "Bip&Drive", amount: 19, status: "LIQUIDADO", category: "Transporte", date: new Date("2026-01-13") },
      { name: "Gasolina", amount: 130, status: "PENDIENTE", category: "Transporte", date: new Date("2026-01-21") },
      { name: "Lavadora", amount: 280, status: "LIQUIDADO", category: "Hogar", date: new Date("2026-01-27") },
    ],
    debts: [
      { name: "Préstamo 1", initialTotal: 8000, remainingTotal: 7720, monthlyFee: 280, status: "LIQUIDADO", isPaid: true },
      { name: "Préstamo 2", initialTotal: 5000, remainingTotal: 4800, monthlyFee: 200, status: "LIQUIDADO", isPaid: true },
      { name: "Coche", initialTotal: 12000, remainingTotal: 11750, monthlyFee: 250, status: "LIQUIDADO", isPaid: true },
      { name: "Abogados", initialTotal: 3000, remainingTotal: 2900, monthlyFee: 100, status: "PENDIENTE", isPaid: false },
    ],
  });

  await createMonthData({
    year: 2026,
    month: 2,
    incomes: [
      { source: "Nómina principal", amount: 2200 },
      { source: "Extra proyecto", amount: 300 },
    ],
    fixedExpenses: [
      { name: "Alquiler", amount: 900, status: "LIQUIDADO" },
      { name: "Luz/agua/gas", amount: 205, status: "PENDIENTE" },
      { name: "Comida", amount: 430, status: "PENDIENTE" },
      { name: "Vodafone", amount: 55, status: "LIQUIDADO" },
    ],
    variableExpenses: [
      { name: "Parking", amount: 52, status: "LIQUIDADO", category: "Transporte", date: new Date("2026-02-10") },
      { name: "Bip Drive", amount: 21, status: "LIQUIDADO", category: "Transporte", date: new Date("2026-02-13") },
      { name: "Gasolina", amount: 140, status: "PENDIENTE", category: "Transporte", date: new Date("2026-02-18") },
      { name: "Mantenimiento coche", amount: 180, status: "PENDIENTE", category: "Transporte", date: new Date("2026-02-24") },
    ],
    debts: [
      { name: "Préstamo 1", initialTotal: 8000, remainingTotal: 7440, monthlyFee: 280, status: "LIQUIDADO", isPaid: true },
      { name: "Préstamo 2", initialTotal: 5000, remainingTotal: 4600, monthlyFee: 200, status: "LIQUIDADO", isPaid: true },
      { name: "Coche", initialTotal: 12000, remainingTotal: 11500, monthlyFee: 250, status: "LIQUIDADO", isPaid: true },
      { name: "Abogados", initialTotal: 3000, remainingTotal: 2800, monthlyFee: 100, status: "LIQUIDADO", isPaid: true },
    ],
  });

  await createMonthData({
    year: 2026,
    month: 3,
    incomes: [
      { source: "Nómina principal", amount: 2200 },
      { source: "Nómina pareja", amount: 1600 },
    ],
    fixedExpenses: [
      { name: "Alquiler", amount: 900, status: "LIQUIDADO" },
      { name: "Luz/agua/gas", amount: 198, status: "LIQUIDADO" },
      { name: "Comida", amount: 450, status: "PENDIENTE" },
      { name: "Vodafone", amount: 55, status: "LIQUIDADO" },
    ],
    variableExpenses: [
      { name: "Seguro coche", amount: 320, status: "PENDIENTE", category: "Transporte", date: new Date("2026-03-03") },
      { name: "Parking", amount: 45, status: "PENDIENTE", category: "Transporte", date: new Date("2026-03-08") },
      { name: "Gasolina", amount: 120, status: "PENDIENTE", category: "Transporte", date: new Date("2026-03-18") },
      { name: "Lavadora", amount: 0, status: "LIQUIDADO", category: "Hogar", date: new Date("2026-03-20") },
    ],
    debts: [
      { name: "Préstamo 1", initialTotal: 8000, remainingTotal: 7160, monthlyFee: 280, status: "PENDIENTE", isPaid: false },
      { name: "Préstamo 2", initialTotal: 5000, remainingTotal: 4400, monthlyFee: 200, status: "PENDIENTE", isPaid: false },
      { name: "Coche", initialTotal: 12000, remainingTotal: 11250, monthlyFee: 250, status: "PENDIENTE", isPaid: false },
      { name: "Abogados", initialTotal: 3000, remainingTotal: 2700, monthlyFee: 100, status: "PENDIENTE", isPaid: false },
    ],
  });

  console.log("✅ Seed completada con meses demo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
