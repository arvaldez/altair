import { PrismaClient } from '@prisma/client';
import { BASIC_PLAN_ID } from './constants';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  const basicPlanExists = await prisma.planConfig.findUnique({
    where: {
      id: BASIC_PLAN_ID,
    },
  });

  if (!basicPlanExists) {
    await createBasicPlan();
  }
}

// execute the main function
main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });

async function createBasicPlan() {
  // create the basic plan config
  const basicPlan = await prisma.planConfig.create({
    data: {
      id: BASIC_PLAN_ID,
      maxQueryCount: 20,
      maxTeamCount: 1,
      maxTeamMemberCount: 2,
      allowMoreTeamMembers: false,
    },
  });

  console.log({ basicPlan });
}

async function createTeamWorkspaces() {
  const teamsWithoutWorkspace = await prisma.team.findMany({
    where: {
      Workspace: {
        none: {},
      },
    },
  });

  console.log('teams without workspaces', teamsWithoutWorkspace);

  if (teamsWithoutWorkspace.length) {
    const proms = teamsWithoutWorkspace.map(({ id, name, ownerId }) => {
      return prisma.workspace.create({
        data: {
          name: `${name} Workspace`,
          ownerId,
          teamId: id,
        },
      });
    });
    const res = await Promise.all(proms);
    console.log('result', res);
  }
}
