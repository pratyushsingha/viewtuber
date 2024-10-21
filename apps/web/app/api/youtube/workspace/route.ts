import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  const { userId } = auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  if (!name) {
    return NextResponse.json(
      {
        success: false,
        message: "Workspace name is missing",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const workspaceExists = await prisma.workspace.findUnique({
      where: {
        name: name,
        ownerId: userId,
      },
    });
    if (workspaceExists) {
      return NextResponse.json(
        { success: false, message: "workspace already exists" },
        { status: 400 }
      );
    }
    const workspace = await prisma.workspace.create({
      data: {
        name: name,
        ownerId: userId,
      },
    });
    return NextResponse.json(
      {
        success: true,
        workspace: workspace,
        message: "Workspace created successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating the workspace", error);
    return NextResponse.json(
      { success: false, message: "Error creating the workspace" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  const name = searchParams.get("name");

  const { userId } = auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!workspaceId || !name) {
    return NextResponse.json(
      {
        success: false,
        message: "Workspace id or name is missing",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
        ownerId: userId,
      },
    });
    if (!workspace) {
      return NextResponse.json(
        { success: false, message: "workspace not found" },
        { status: 404 }
      );
    }
    const updatedWorkspace = await prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        name: name,
      },
    });
    return NextResponse.json(
      {
        success: true,
        workspace: updatedWorkspace,
        message: "Workspace updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating the workspace", error);
    return NextResponse.json(
      { success: false, message: "Error updating the workspace" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  const { userId } = auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  if (!workspaceId) {
    return NextResponse.json(
      {
        success: false,
        message: "Workspace id or name is missing",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
      },
      select: {
        ownerId: true,
      },
    });
    if (!workspace) {
      return NextResponse.json(
        {
          success: false,
          message: "workspace not found",
        },
        { status: 401 }
      );
    }

    if (workspace.ownerId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "U don't have permissioon to delete this organization",
        },
        { status: 401 }
      );
    }
    const deletedWorkspace = await prisma.workspace.delete({
      where: {
        id: workspaceId,
      },
    });
    return NextResponse.json(
      {
        success: true,
        workspaceId: deletedWorkspace.id,
        message: "Workspace deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error while deleting workspace", error);
    return NextResponse.json(
      { success: false, message: "Error deleting the workspace" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const skip = (page - 1) * limit;

  const { userId } = auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    const workspaces = await prisma.workspace.findMany({
      skip: skip,
      take: limit,
      where: {
        ownerId: userId,
      },
      include: {
        Owner: {
          select: {
            id: true,
            email: true,
          },
        },
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            workspaceId: true,
          },
        },
      },
    });

    const totalWorkspaces = await prisma.workspace.count();
    return NextResponse.json({
      success: true,
      data: {
        workspaces,
        pagination: {
          totalWorkspaces,
          totalPages: Math.ceil(totalWorkspaces / limit),
          currentPage: page,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching workspaces", error);
    return NextResponse.json(
      { success: false, message: "Error fetching workspaces" },
      { status: 500 }
    );
  }
}
