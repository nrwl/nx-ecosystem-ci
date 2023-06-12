export const preset = 'ts-jest'
export const transform = {
	'^.+\\.(ts|tsx)?$': 'ts-jest',
	'^.+\\.(js|jsx)$': 'babel-jest',
}
export const moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
