
-- Recreate trigger on auth.users for profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recreate trigger on profiles for welcome email
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON public.profiles;
CREATE TRIGGER trigger_send_welcome_email
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.send_welcome_email_on_signup();
