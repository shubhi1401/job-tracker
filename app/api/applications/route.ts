import prisma from "@/lib/prisma";
import { NextResponse} from "next/server";
export async function POST(request:Request){
    const body = await request.json();
    const application = await prisma.application.create({
        data:body,
    });
return NextResponse.json(application , {status:201});
}
export async function GET() {
   const application=await prisma.application.findMany({
    orderBy:{
        createdAt:"desc",
    },
   });
   return NextResponse.json(application);
}