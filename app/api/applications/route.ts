import prisma from "@/lib/prisma";
import { NextResponse} from "next/server";
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.company || !body.role || !body.location || !body.applicationDate) {
      return NextResponse.json(
        {
          error:
            "Company, role, location and application date are required.",
        },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        company: body.company,
        role: body.role,
        location: body.location,
        jobUrl: body.jobUrl || null,
        salary: body.salary || null,
        status: body.status,
        recruiterName: body.recruiterName || null,
        recruiterEmail: body.recruiterEmail || null,
        applicationDate: new Date(body.applicationDate),
        notes: body.notes || null,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("CREATE APPLICATION ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
export async function DELETE( request : Request ,
    {params}:{params:Promise<{id:string}>}
) {
    const {id}=await params;
    const application = await prisma.application.delete({
        where:{
            id:Number(id),
        },
    });
    return NextResponse.json(application);
}
export async function GET() {
   const application=await prisma.application.findMany({
    orderBy:{
        createdAt:"desc",
    },
   });
   return NextResponse.json(application);
}