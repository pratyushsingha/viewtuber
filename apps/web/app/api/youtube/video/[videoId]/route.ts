// import { NextResponse } from "next/server";

// type VideoIdParams = {
//   videoId: string;
// };

// export async function POST(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const channelId = searchParams.get("channelId");
//   if (!channelId) {
//     return NextResponse.json(
//       { success: false, message: "Channel ID is missing" },
//       { status: 400 }
//     );
//   }

//   const {
//     title,
//     description,
//     keywords,
//     tags,
//     categoory,
//     defaultLanguage,
//     privacyStatus,
//     license,
//     thumbnail,
//     selfDeclaredMadeForKids,
//   } = await request.json();

//   const { userId } = auth();
//   if (!userId) {
//     return NextResponse.json(
//       { success: false, message: "Unauthorized" },
//       { status: 401 }
//     );
//   }
// try {
//     const 
// } catch (error) {
    
// }
// }
