import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function PUT(
    request:Request,
    {params}:{params:Promise<{id:string}>}
)
{const {id}=await params;
const body= await request.json();
const application=await prisma.application.update({
    where:{
        id:Number(id),
    },
    data:body,
});
return NextResponse.json(application);
} 
export async function DELETE(
    request:Request,
    {params}:{params:Promise<{id:string}>}
){}