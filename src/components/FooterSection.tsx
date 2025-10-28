import React from "react";

interface FooterSectionProps {
  title: string;
  links: string[];
}

const FooterSection: React.FC<FooterSectionProps> = ({ title, links }) => {
  return (
    <div>
      <h5 className="font-semibold mb-3">{title}</h5>
      <ul className="space-y-2 text-sm text-gray-400">
        {links.map((link) => (
          <li key={link} className="cursor-pointer hover:text-white transition-colors">
            {link}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FooterSection;
