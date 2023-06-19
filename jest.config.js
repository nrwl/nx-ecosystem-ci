export default {
	preset: 'ts-jest',
	transform: {
		'^.+\\.(ts|tsx)?$': 'ts-jest',
		'^.+\\.(js|jsx)$': 'babel-jest',
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
}
