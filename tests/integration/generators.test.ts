import { generateName } from '../../generators/generateName';
import { generateRelationship } from '../../generators/relationshipGenerator';
import { Guild } from 'discord.js';

describe('Generators', () => {
  describe('generateName', () => {
    it('should return a string', () => {
      const name = generateName();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });
  });

  describe('generateRelationship', () => {
    it('should return a relationship string', () => {
      // Mock Guild
      const mockGuild = {
        members: {
          fetch: jest.fn().mockResolvedValue([]),
        },
      } as unknown as Guild;

      const relationship = generateRelationship(mockGuild);
      expect(typeof relationship).toBe('string');
      expect(relationship).toContain('💖');
    });
  });
});
