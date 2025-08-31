import React from 'react';
import { MessageSquare } from 'lucide-react';

const CommentIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <MessageSquare size={20} {...props} />
);

export default CommentIcon;