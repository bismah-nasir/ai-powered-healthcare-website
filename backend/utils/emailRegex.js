/**
 * Email format check shared by the User and Contact models.
 * Allows + tags (ali+work@gmail.com), subdomains, hyphenated domains
 * and domain endings of any length (.info, .design, .health).
 */
const emailRegex = /^[\w.+-]+@[\w-]+(\.[\w-]+)*\.[a-zA-Z]{2,}$/;

export default emailRegex;
