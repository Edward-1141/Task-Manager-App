import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Workspace',
};

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 