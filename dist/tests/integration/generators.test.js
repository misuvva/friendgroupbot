"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateName_1 = require("../../generators/generateName");
const relationshipGenerator_1 = require("../../generators/relationshipGenerator");
describe('Generators', () => {
    describe('generateName', () => {
        it('should return a string', () => {
            const name = (0, generateName_1.generateName)();
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
            };
            const relationship = (0, relationshipGenerator_1.generateRelationship)(mockGuild);
            expect(typeof relationship).toBe('string');
            expect(relationship).toContain('💖');
        });
    });
});
