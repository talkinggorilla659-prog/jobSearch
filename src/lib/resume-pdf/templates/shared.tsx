import { Text, View, StyleSheet } from '@react-pdf/renderer';

// Color palettes for different templates
export const COLORS = {
  modern: {
    primary: '#2563eb',    // Blue
    secondary: '#64748b',  // Slate
    text: '#1e293b',       // Dark slate
    muted: '#64748b',      // Gray
    accent: '#3b82f6',     // Light blue
    border: '#e2e8f0',     // Light gray
  },
  classic: {
    primary: '#1a1a1a',    // Near black
    secondary: '#4a4a4a',  // Dark gray
    text: '#1a1a1a',       // Near black
    muted: '#666666',      // Medium gray
    accent: '#2c3e50',     // Dark blue-gray
    border: '#cccccc',     // Light gray
  },
  minimalist: {
    primary: '#000000',    // Black
    secondary: '#555555',  // Gray
    text: '#333333',       // Dark gray
    muted: '#777777',      // Medium gray
    accent: '#000000',     // Black
    border: '#eeeeee',     // Very light gray
  },
};

// Common font sizes
export const FONT_SIZES = {
  name: 24,
  title: 14,
  sectionHeader: 12,
  body: 10,
  small: 9,
};

// Common spacing
export const SPACING = {
  page: 40,
  section: 12,
  item: 6,
  line: 4,
};

// Shared styles that can be extended
export const baseStyles = StyleSheet.create({
  page: {
    padding: SPACING.page,
    fontFamily: 'Helvetica',
    fontSize: FONT_SIZES.body,
    lineHeight: 1.4,
  },
  section: {
    marginBottom: SPACING.section,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sectionHeader,
    fontFamily: 'Helvetica-Bold',
    marginBottom: SPACING.item,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: SPACING.line,
  },
  bullet: {
    width: 12,
    fontSize: FONT_SIZES.body,
  },
  bulletText: {
    flex: 1,
    fontSize: FONT_SIZES.body,
  },
});

// Reusable components
interface SectionProps {
  title: string;
  children: React.ReactNode;
  color?: string;
  borderColor?: string;
}

export function Section({ title, children, color = '#000', borderColor }: SectionProps) {
  return (
    <View style={baseStyles.section}>
      <Text
        style={[
          baseStyles.sectionTitle,
          { color, borderBottomWidth: borderColor ? 1 : 0, borderBottomColor: borderColor, paddingBottom: 4 },
        ]}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

interface BulletListProps {
  items: string[];
  color?: string;
}

export function BulletList({ items, color = '#000' }: BulletListProps) {
  return (
    <View>
      {items.map((item, index) => (
        <View key={index} style={baseStyles.bulletItem}>
          <Text style={[baseStyles.bullet, { color }]}>-</Text>
          <Text style={[baseStyles.bulletText, { color }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

interface SkillsGridProps {
  skills: string[];
  columns?: number;
  color?: string;
}

export function SkillsGrid({ skills, columns = 3, color = '#000' }: SkillsGridProps) {
  const rows: string[][] = [];
  for (let i = 0; i < skills.length; i += columns) {
    rows.push(skills.slice(i, i + columns));
  }

  return (
    <View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row', marginBottom: 4 }}>
          {row.map((skill, colIndex) => (
            <Text
              key={colIndex}
              style={{
                width: `${100 / columns}%`,
                fontSize: FONT_SIZES.body,
                color,
              }}
            >
              - {skill}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

interface ContactRowProps {
  items: (string | undefined)[];
  color?: string;
  separator?: string;
}

export function ContactRow({ items, color = '#666', separator = ' | ' }: ContactRowProps) {
  const validItems = items.filter(Boolean);

  return (
    <Text style={{ fontSize: FONT_SIZES.small, color, textAlign: 'center' }}>
      {validItems.join(separator)}
    </Text>
  );
}
