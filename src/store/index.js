import Vue from "vue";
import Vuex from "vuex";
import fs from "fs";
import path from "path";
const fsPromises = fs.promises;

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		categories: [],
		error: null,
		searchField: "",
		currentCategory: null,
	},
	mutations: {
		setCategories(state, categories) {
			state.categories = categories;
		},
		setCurrentCategory(state, category) {
			state.currentCategory = category;
		},
		setSearchField(state, searchField) {
			state.searchField = searchField;
		},
		setError(state, error) {
			state.error = error;
		},
	},
	actions: {
		async fetchCategories(
			{ commit, dispatch },
			// pathDirectory = "C:/Users/sindr/Downloads/Extention"
			pathDirectory = "G:/Общие диски/Communication Design/Ilya Romanov/Шаблоны/Extention"
		) {
			try {
				const stats = await fsPromises.lstat(pathDirectory);
				if (stats.isDirectory()) {
					const categories = await fsPromises.readdir(pathDirectory);

					const categoriesList = await Promise.all(
						categories.map(async (categoryName) => {
							const categoryPath = path.join(
								pathDirectory,
								categoryName
							);

							const variants = await dispatch(
								"fetchVariants",
								categoryPath
							);

							return {
								name: categoryName,
								path: categoryPath,
								variants,
							};
						})
					);

					// console.log(categoriesList);

					commit("setCategories", categoriesList);
				}
			} catch (err) {
				console.error("Error reading directory:", err);
				commit("setError", `Error reading directory: ${err.message}`);
			}
		},
		async fetchVariants({ dispatch }, categoryPath) {
			try {
				const stats = await fsPromises.lstat(categoryPath);
				if (stats.isDirectory()) {
					const files = await fsPromises.readdir(categoryPath);

					const variantsList = await Promise.all(
						files.map(async (variantName) => {
							const variantPath = path.join(
								categoryPath,
								variantName
							);
							const variantFiles = await dispatch(
								"fetchFiles",
								variantPath
							);

							if (
								variantFiles &&
								variantFiles.length > 0 &&
								variantFiles.some(
									(file) =>
										file.format === ".aep" ||
										file.format === ".mov"
								)
							) {
								const formats = variantFiles
									.filter(
										(file) =>
											file.format === ".aep" ||
											file.format === ".mov"
									)
									.map((file) => file.format);
								const filesPaths = variantFiles
									.filter(
										(file) =>
											file.format === ".aep" ||
											file.format === ".mov"
									)
									.map((file) => file.path);
								const image = await dispatch(
									"formatToBase64",
									variantFiles.find((file) =>
										[
											".gif",
											".jpg",
											".png",
											".jpeg",
											".webp",
										].includes(file.format)
									).path
								);

								return {
									name: variantName,
									path: variantPath,
									files: variantFiles,
									image,
									formats,
									filesPaths,
								};
							}
							return null;
						})
					);

					return variantsList.filter((item) => item !== null);
				}
			} catch (error) {
				console.error(
					"Error reading directory in fetchVariants:",
					error
				);
				this.commit(
					"setError",
					`Error reading directory: ${error.message}`
				);
			}
		},
		async fetchFiles(_, directoryPath) {
			try {
				const stats = await fsPromises.lstat(directoryPath);
				if (stats.isDirectory()) {
					const files = await fsPromises.readdir(directoryPath);

					return await Promise.all(
						files.map(async (fileName) => {
							const filePath = path.join(directoryPath, fileName);
							const fileFormat = path.extname(fileName);

							return {
								name: fileName,
								path: filePath,
								format: fileFormat,
							};
						})
					);
				}
			} catch (err) {
				console.error("Error reading directory:", err);
				this.commit(
					"setError",
					`Error reading directory: ${err.message}`
				);
				return [];
			}
		},
		async formatToBase64(_, filePath) {
			try {
				const data = await fsPromises.readFile(filePath);
				return `data:image/${path
					.extname(filePath)
					.slice(1)};base64,${data.toString("base64")}`;
			} catch (error) {
				console.error("Error reading file:", error);
			}
		},
	},
	getters: {
		getFilteredCategories(state) {
			if (!state.searchField) {
				return state.categories;
			}

			const lowercasedSearchField = state.searchField.toLowerCase();

			return state.categories.filter((category) =>
				category.name.toLowerCase().includes(lowercasedSearchField)
			);
		},
		getSearchField(state) {
			return state.searchField;
		},
		getCurrentCategory(state) {
			return state.currentCategory;
		},
		getCategories(state) {
			return state.categories;
		},
		getError(state) {
			return state.error;
		},
	},
});
