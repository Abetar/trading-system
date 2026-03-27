 import { prisma } from "./prismaClient"

async function main() {
  await prisma.asset.createMany({
    data: [
      {
        symbol: "IVVPESO",
        name: "iShares S&P 500 MXN Hedged",
        type: "ETF",
        currency: "MXN",
      },
      {
        symbol: "IVV",
        name: "iShares Core S&P 500 ETF",
        type: "ETF",
        currency: "USD",
      },
      {
        symbol: "VXUS",
        name: "Vanguard Total International Stock ETF",
        type: "ETF",
        currency: "USD",
      },
      {
        symbol: "SGOV",
        name: "iShares 0-3 Month Treasury Bond ETF",
        type: "ETF",
        currency: "USD",
      },
    ],
    skipDuplicates: true,
  })

  console.log("Seed ejecutado correctamente")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })