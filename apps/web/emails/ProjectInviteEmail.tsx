import React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface ProjectInviteEmailProps {
  inviteUrl: string;
  projectName: string;
  role: "youtuber" | "editor";
}

const ProjectInviteEmail: React.FC<ProjectInviteEmailProps> = ({
  inviteUrl,
  projectName,
  role,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Join our project on ezytodo</Preview>
      <Body className="bg-gray-100 font-sans">
        <Container className="bg-white border border-gray-200 rounded-lg p-6 max-w-xl mx-auto my-10">
          <Section>
            <Text className="text-2xl font-bold mb-4 text-gray-800">
              You're Invited to Collaborate on the Project "{projectName}"
            </Text>
            <Text className="text-gray-600 mb-4">
              You've been invited to collaborate on the project "{projectName}"
              as an "{role}" on viewtuber. It's a great place to work together
              and manage tasks efficiently.
            </Text>
            <Text className="text-gray-600 mb-6">
              Click the button below to accept the invitation and get started:
            </Text>
            <Button
              className="bg-blue-600 text-white rounded-md font-semibold text-lg hover:bg-blue-500 focus:bg-blue-700 focus:outline-none px-5 py-3"
              href={inviteUrl}
            >
              Join Project
            </Button>
            <Text>or copy and paste the link</Text>
            <Text className="text-gray-500 mt-6">
              If you didn’t expect this invitation, feel free to ignore this
              email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ProjectInviteEmail;
