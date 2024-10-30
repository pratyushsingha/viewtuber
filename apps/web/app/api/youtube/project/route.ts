import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { auth } from "../../../../auth";

export async function POST(request: Request) {
  const { name: projectName, description } = await request.json();

  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!projectName) {
    return NextResponse.json(
      {
        success: false,
        message: "Project name is missing",
      },
      {
        status: 400,
      }
    );
  }
  const user = session.user;
  try {
    const projectExists = await prisma.project.findUnique({
      where: {
        name: projectName,
        ownerId: user.id,
      },
    });
    if (projectExists) {
      return NextResponse.json(
        { success: false, message: "Project already exists" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name: projectName,
        description: description ?? null,
        ownerId: user.id as string,
      },
    });
    await prisma.member.create({
      data: {
        userId: session.user.id,
        projectId: project.id,
        role: "youtuber",
        status: "accepted",
        email: user.email,
      },
    });
    return NextResponse.json({
      success: true,
      project: project,
      message: "Project created successfully",
    });
  } catch (error) {
    console.error("Error creating the project", error);
    return NextResponse.json(
      { success: false, message: "Error creating the project" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const { name: projectName, description } = await request.json();

  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!projectId || !projectName) {
    return NextResponse.json(
      { success: false, message: "Project ID or Project name is missing" },
      { status: 400 }
    );
  }
  const user = session.user;
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 400 }
      );
    }
    if (project.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        name: projectName,
        description: description ?? null,
      },
    });
    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Error updating the project", error);
    return NextResponse.json(
      { success: false, message: "Error updating the project" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  if (!projectId) {
    return NextResponse.json(
      { success: false, message: "Project ID is missing" },
      { status: 400 }
    );
  }
  const user = session.user;

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 400 }
      );
    }
    if (project.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });
    return NextResponse.json({
      success: true,
      project: project.id,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting the project", error);
    return NextResponse.json(
      { success: false, message: "Error deleting the project" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  if (!projectId) {
    return NextResponse.json(
      { success: false, message: "Project ID is missing" },
      { status: 400 }
    );
  }
  const user = session.user;
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
      },
      include: {
        members: {
          select: {
            userId: true,
            role: true,
          },
        },
        // Video: {
        //   select: {
        //     id: true,
        //     title: true,
        //     description: true,
        //     url: true,
        //     publishedAt: true,
        //     thumbnailUrl: true,
        //     status: true,
        //     VideoTag: {
        //       select: {
        //         tag: {
        //           select: {
        //             name: true,
        //           },
        //         },
        //       },
        //     },
        //   },
        // },
      },
    });
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        project: project,
        message: "Project fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching the project", error);
    return NextResponse.json(
      { success: false, message: "Error fetching the project" },
      { status: 500 }
    );
  }
}
