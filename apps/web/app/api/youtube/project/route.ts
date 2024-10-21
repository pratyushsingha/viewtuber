import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceid");
  const { name: projectName, description } = await request.json();

  const { userId } = auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!workspaceId || !projectName) {
    return NextResponse.json(
      {
        success: false,
        message: "Workspace ID or Project name is missing",
      },
      {
        status: 400,
      }
    );
  }
  try {
    const workspaceExists = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });
    if (!workspaceExists) {
      return NextResponse.json(
        { success: false, message: "Workspace not found" },
        { status: 400 }
      );
    }
    const projectExists = await prisma.project.findUnique({
      where: {
        name: projectName,
        workspaceId: workspaceId,
      },
    });
    if (projectExists) {
      return NextResponse.json(
        { success: false, message: "Project already exists" },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({
      where: {
        userId,
      },
    });

    
    const project = await prisma.project.create({
      data: {
        name: projectName,
        workspaceId: workspaceId,
        description: description ?? null,
        ownerId: userId,
      },
    });
    await prisma.member.create({
      data: {
        userId: userId,
        projectId: project.id,
        role: "youtuber",
        status: "accepted",
        email: user?.email,
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
  const projectName = searchParams.get("projectName");

  const { userId } = auth();
  if (!userId) {
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
    if (project.ownerId !== userId) {
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

  const { userId } = auth();
  if (!userId) {
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
    if (project.ownerId !== userId) {
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

  const { userId } = auth();
  if (!userId) {
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
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
      },
      include: {
        Workspace: {
          select: {
            id: true,
            name: true,
            description: true,
            Owner: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
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
